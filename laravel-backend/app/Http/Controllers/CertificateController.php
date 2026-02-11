<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\HourLog;
use App\Models\Evaluation;
use App\Models\Application;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class CertificateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Certificate::with(['student', 'slot.site', 'issuer']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isPreceptor()) {
            $query->where('issued_by', $user->id);
        } elseif ($user->isSiteManager()) {
            $siteIds = $user->managedSites()->pluck('id');
            $query->whereHas('slot', fn($q) => $q->whereIn('site_id', $siteIds));
        }
        // coordinator and admin see all

        $certificates = $query->orderBy('issued_date', 'desc')->get();

        return response()->json(['certificates' => $certificates]);
    }

    public function show(Certificate $certificate): JsonResponse
    {
        $certificate->load(['student.studentProfile.university', 'student.studentProfile.program', 'slot.site', 'issuer']);

        return response()->json(['certificate' => $certificate]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'student_id' => ['required', 'uuid', 'exists:users,id'],
            'slot_id' => ['required', 'uuid', 'exists:rotation_slots,id'],
            'title' => ['required', 'string', 'max:255'],
        ]);

        // Verify the student has an accepted application for this slot
        $application = Application::where('student_id', $validated['student_id'])
            ->where('slot_id', $validated['slot_id'])
            ->where('status', 'accepted')
            ->first();

        if (!$application) {
            return response()->json(['message' => 'Student does not have an accepted application for this rotation.'], 422);
        }

        // Check if certificate already exists
        $existing = Certificate::where('student_id', $validated['student_id'])
            ->where('slot_id', $validated['slot_id'])
            ->where('status', 'issued')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'A certificate has already been issued for this student and rotation.'], 422);
        }

        // Calculate total approved hours
        $totalHours = HourLog::where('student_id', $validated['student_id'])
            ->where('slot_id', $validated['slot_id'])
            ->where('status', 'approved')
            ->sum('hours_worked');

        // Get latest final evaluation score (or mid-rotation if no final)
        $evaluation = Evaluation::where('student_id', $validated['student_id'])
            ->where('slot_id', $validated['slot_id'])
            ->whereIn('type', ['final', 'mid_rotation'])
            ->where('is_submitted', true)
            ->orderByRaw("CASE WHEN type = 'final' THEN 0 ELSE 1 END")
            ->orderBy('created_at', 'desc')
            ->first();

        // Generate unique certificate number
        $certNumber = 'CL-' . strtoupper(Str::random(4)) . '-' . date('Y') . '-' . str_pad(Certificate::count() + 1, 4, '0', STR_PAD_LEFT);

        $certificate = Certificate::create([
            'student_id' => $validated['student_id'],
            'slot_id' => $validated['slot_id'],
            'issued_by' => $request->user()->id,
            'certificate_number' => $certNumber,
            'title' => $validated['title'],
            'total_hours' => $totalHours,
            'overall_score' => $evaluation?->overall_score,
            'status' => 'issued',
            'issued_date' => now()->toDateString(),
        ]);

        return response()->json([
            'certificate' => $certificate->load(['student', 'slot.site', 'issuer']),
        ], 201);
    }

    public function eligibility(Request $request, string $slotId, string $studentId): JsonResponse
    {
        // Get accepted application
        $application = Application::where('student_id', $studentId)
            ->where('slot_id', $slotId)
            ->where('status', 'accepted')
            ->first();

        // Total approved hours
        $totalHours = HourLog::where('student_id', $studentId)
            ->where('slot_id', $slotId)
            ->where('status', 'approved')
            ->sum('hours_worked');

        // Pending hours
        $pendingHours = HourLog::where('student_id', $studentId)
            ->where('slot_id', $slotId)
            ->where('status', 'pending')
            ->sum('hours_worked');

        // Has evaluation
        $hasEvaluation = Evaluation::where('student_id', $studentId)
            ->where('slot_id', $slotId)
            ->where('is_submitted', true)
            ->exists();

        // Already has certificate
        $hasCertificate = Certificate::where('student_id', $studentId)
            ->where('slot_id', $slotId)
            ->where('status', 'issued')
            ->exists();

        return response()->json([
            'eligible' => $application !== null && $hasEvaluation && !$hasCertificate && $totalHours > 0,
            'has_application' => $application !== null,
            'total_approved_hours' => (float) $totalHours,
            'pending_hours' => (float) $pendingHours,
            'has_evaluation' => $hasEvaluation,
            'has_certificate' => $hasCertificate,
        ]);
    }

    public function downloadPdf(Request $request, Certificate $certificate)
    {
        // Authenticate via query token (for window.open() browser downloads)
        $user = $request->user();
        if (!$user && $request->filled('token')) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->input('token'));
            if (!$token) {
                return response()->json(['message' => 'Unauthorized.'], 401);
            }
        }

        $certificate->load([
            'student.studentProfile.university',
            'student.studentProfile.program',
            'slot.site.manager',
            'slot.preceptor',
            'issuer',
        ]);

        $frontendUrl = config('app.frontend_url', 'https://michelevens.github.io/ClinicLink');
        $verifyUrl = $frontendUrl . '/verify/' . $certificate->certificate_number;

        // Generate QR code as base64 PNG
        $qrPng = QrCode::format('png')->size(200)->margin(1)->generate($verifyUrl);
        $qrCode = 'data:image/png;base64,' . base64_encode($qrPng);

        $university = $certificate->student->studentProfile?->university;
        $program = $certificate->student->studentProfile?->program;

        $pdf = Pdf::loadView('certificates.template', [
            'certificate' => $certificate,
            'qrCode' => $qrCode,
            'verifyUrl' => $verifyUrl,
            'university' => $university,
            'program' => $program,
        ])->setPaper('letter', 'landscape');

        $filename = 'ClinicLink-Certificate-' . $certificate->certificate_number . '.pdf';

        return $pdf->download($filename);
    }

    public function publicVerify(string $certificateNumber): JsonResponse
    {
        $certificate = Certificate::where('certificate_number', $certificateNumber)
            ->with(['student', 'slot.site', 'slot.preceptor', 'issuer'])
            ->first();

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found.', 'valid' => false], 404);
        }

        return response()->json([
            'valid' => $certificate->status === 'issued',
            'status' => $certificate->status,
            'certificate_number' => $certificate->certificate_number,
            'title' => $certificate->title,
            'student_name' => $certificate->student->first_name . ' ' . $certificate->student->last_name,
            'specialty' => $certificate->slot->specialty,
            'site_name' => $certificate->slot->site->name,
            'preceptor_name' => $certificate->slot->preceptor ? $certificate->slot->preceptor->first_name . ' ' . $certificate->slot->preceptor->last_name : null,
            'total_hours' => $certificate->total_hours,
            'overall_score' => $certificate->overall_score,
            'issued_date' => $certificate->issued_date->format('Y-m-d'),
            'issued_by' => $certificate->issuer->first_name . ' ' . $certificate->issuer->last_name,
            'revoked_date' => $certificate->revoked_date?->format('Y-m-d'),
            'revocation_reason' => $certificate->revocation_reason,
        ]);
    }

    public function revoke(Request $request, Certificate $certificate): JsonResponse
    {
        if ($certificate->status === 'revoked') {
            return response()->json(['message' => 'Certificate is already revoked.'], 422);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $certificate->update([
            'status' => 'revoked',
            'revoked_date' => now()->toDateString(),
            'revocation_reason' => $validated['reason'],
        ]);

        return response()->json(['certificate' => $certificate->load(['student', 'slot.site', 'issuer'])]);
    }
}
