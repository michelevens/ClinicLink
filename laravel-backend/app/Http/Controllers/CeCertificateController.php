<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\CeCertificate;
use App\Models\StudentProfile;
use App\Models\UniversityCePolicy;
use App\Services\CECertificateGenerator;
use App\Services\CEEligibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CeCertificateController extends Controller
{
    // ─── CE Policy CRUD (coordinator/admin) ───────────────────────

    public function getPolicy(Request $request, string $universityId): JsonResponse
    {
        $policy = UniversityCePolicy::where('university_id', $universityId)->first();

        return response()->json(['policy' => $policy]);
    }

    public function upsertPolicy(Request $request, string $universityId): JsonResponse
    {
        $user = $request->user();
        if (!$user->isCoordinator() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'offers_ce' => ['required', 'boolean'],
            'accrediting_body' => ['nullable', 'string', 'max:255'],
            'contact_hours_per_rotation' => ['required', 'numeric', 'min:0', 'max:999'],
            'max_hours_per_year' => ['nullable', 'numeric', 'min:0', 'max:999'],
            'requires_final_evaluation' => ['boolean'],
            'requires_midterm_evaluation' => ['boolean'],
            'requires_minimum_hours' => ['boolean'],
            'minimum_hours_required' => ['nullable', 'numeric', 'min:0'],
            'approval_required' => ['boolean'],
            'signer_name' => ['nullable', 'string', 'max:255'],
            'signer_credentials' => ['nullable', 'string', 'max:255'],
        ]);

        $policy = UniversityCePolicy::updateOrCreate(
            ['university_id' => $universityId],
            $validated
        );

        return response()->json(['policy' => $policy]);
    }

    // ─── CE Certificates ──────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = CeCertificate::with(['university', 'preceptor', 'application.slot.site', 'approvedByUser']);

        if ($user->isStudent() || $user->isSiteManager()) {
            // Students and site managers should not see CE certificates in the list
            return response()->json(['ce_certificates' => []]);
        } elseif ($user->isPreceptor()) {
            $query->where('preceptor_id', $user->id);
        } elseif ($user->isCoordinator()) {
            // Filter by university_id param or coordinator's own university
            $universityId = $request->input('university_id') ?? $user->studentProfile?->university_id;
            if ($universityId) {
                $query->where('university_id', $universityId);
            }
        }
        // Admin sees all

        $certificates = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['ce_certificates' => $certificates]);
    }

    public function show(Request $request, CeCertificate $ceCertificate): JsonResponse
    {
        $user = $request->user();

        if (!$this->canAccessCeCertificate($user, $ceCertificate)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $ceCertificate->load([
            'university',
            'preceptor',
            'application.slot.site',
            'application.student.studentProfile',
            'approvedByUser',
        ]);

        return response()->json(['ce_certificate' => $ceCertificate]);
    }

    public function approve(Request $request, CeCertificate $ceCertificate): JsonResponse
    {
        $user = $request->user();
        if (!$user->isCoordinator() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($ceCertificate->status !== 'pending') {
            return response()->json(['message' => 'Only pending certificates can be approved.'], 422);
        }

        $ceCertificate->update([
            'status' => 'approved',
            'approved_by' => $user->id,
            'issued_at' => now(),
        ]);

        // Generate PDF
        $generator = new CECertificateGenerator();
        $generator->generatePdf($ceCertificate);

        $ceCertificate->update(['status' => 'issued']);

        $ceCertificate->load(['university', 'preceptor', 'application.slot.site', 'approvedByUser']);

        return response()->json(['ce_certificate' => $ceCertificate]);
    }

    public function reject(Request $request, CeCertificate $ceCertificate): JsonResponse
    {
        $user = $request->user();
        if (!$user->isCoordinator() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($ceCertificate->status !== 'pending') {
            return response()->json(['message' => 'Only pending certificates can be rejected.'], 422);
        }

        $validated = $request->validate([
            'rejection_reason' => ['required', 'string', 'max:1000'],
        ]);

        $ceCertificate->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['rejection_reason'],
        ]);

        $ceCertificate->load(['university', 'preceptor', 'application.slot.site']);

        return response()->json(['ce_certificate' => $ceCertificate]);
    }

    public function download(Request $request, CeCertificate $ceCertificate)
    {
        // Authenticate via query token (for window.open() browser downloads)
        $user = $request->user();
        if (!$user && $request->filled('token')) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->input('token'));
            if (!$token) {
                return response()->json(['message' => 'Unauthorized.'], 401);
            }
            $user = $token->tokenable;
        }

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        // Authorization: preceptor who owns it, coordinator for the university, or admin
        if (!$this->canAccessCeCertificate($user, $ceCertificate)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!$ceCertificate->certificate_path || $ceCertificate->status !== 'issued') {
            return response()->json(['message' => 'Certificate PDF not available.'], 404);
        }

        $filename = 'CE-Certificate-' . substr($ceCertificate->verification_uuid, 0, 8) . '.pdf';

        return Storage::disk()->download($ceCertificate->certificate_path, $filename);
    }

    // ─── Public verification ──────────────────────────────────────

    public function publicVerify(string $uuid): JsonResponse
    {
        $certificate = CeCertificate::where('verification_uuid', $uuid)
            ->with(['university', 'preceptor', 'application.slot.site'])
            ->first();

        if (!$certificate) {
            return response()->json(['message' => 'Certificate not found.', 'valid' => false], 404);
        }

        return response()->json([
            'valid' => $certificate->status === 'issued',
            'status' => $certificate->status,
            'verification_uuid' => $certificate->verification_uuid,
            'preceptor_name' => $certificate->preceptor->first_name . ' ' . $certificate->preceptor->last_name,
            'contact_hours' => $certificate->contact_hours,
            'university_name' => $certificate->university->name,
            'specialty' => $certificate->application->slot->specialty,
            'site_name' => $certificate->application->slot->site->name,
            'rotation_period' => $certificate->application->slot->start_date . ' to ' . $certificate->application->slot->end_date,
            'issued_at' => $certificate->issued_at?->format('Y-m-d'),
        ]);
    }

    // ─── Eligibility check ───────────────────────────────────────

    public function checkEligibility(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        // Must be the preceptor, site_manager for the site, coordinator, or admin
        $application->loadMissing('slot.site');
        $slot = $application->slot;

        $canCheck = $user->isAdmin()
            || ($user->isPreceptor() && $slot->preceptor_id === $user->id)
            || ($user->isSiteManager() && $slot->site->manager_id === $user->id)
            || $user->isCoordinator();

        if (!$canCheck) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $service = new CEEligibilityService();
        $result = $service->check($application);

        return response()->json($result);
    }

    private function canAccessCeCertificate($user, CeCertificate $ceCertificate): bool
    {
        if ($user->isAdmin()) return true;

        // Preceptor who owns it
        if ($user->isPreceptor() && $ceCertificate->preceptor_id === $user->id) return true;

        // Coordinator for the same university
        if ($user->isCoordinator()) {
            $userUni = $user->studentProfile?->university_id;
            if ($userUni && $ceCertificate->university_id === $userUni) return true;
        }

        return false;
    }
}
