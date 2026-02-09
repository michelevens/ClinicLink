<?php

namespace App\Http\Controllers;

use App\Models\Certificate;
use App\Models\HourLog;
use App\Models\Evaluation;
use App\Models\Application;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

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
