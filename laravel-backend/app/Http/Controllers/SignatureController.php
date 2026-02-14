<?php

namespace App\Http\Controllers;

use App\Mail\SignatureRequestMail;
use App\Models\AffiliationAgreement;
use App\Models\Signature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SignatureController extends Controller
{
    /**
     * List signatures for an agreement.
     */
    public function index(Request $request, AffiliationAgreement $agreement): JsonResponse
    {
        $user = $request->user();

        if (!$this->canAccessAgreement($user, $agreement)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $signatures = $agreement->signatures()
            ->with(['signer', 'requester'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['data' => $signatures]);
    }

    /**
     * Request a signature from someone (sends email notification).
     */
    public function requestSignature(Request $request, AffiliationAgreement $agreement): JsonResponse
    {
        $user = $request->user();

        if (!$this->canManageAgreement($user, $agreement)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'signer_name' => ['required', 'string', 'max:255'],
            'signer_email' => ['required', 'email', 'max:255'],
            'signer_role' => ['required', 'in:university,site'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        // Check if there's already a pending signature request for this email on this agreement
        $existing = $agreement->signatures()
            ->where('signer_email', $validated['signer_email'])
            ->where('status', 'requested')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'A signature request is already pending for this email.'], 422);
        }

        $signature = Signature::create([
            'signable_type' => AffiliationAgreement::class,
            'signable_id' => $agreement->id,
            'signer_role' => $validated['signer_role'],
            'signer_name' => $validated['signer_name'],
            'signer_email' => $validated['signer_email'],
            'requested_by' => $user->id,
            'status' => 'requested',
            'request_message' => $validated['message'] ?? null,
            'requested_at' => now(),
        ]);

        $agreement->refreshSignatureStatus();

        // Send email notification
        try {
            Mail::to($validated['signer_email'])->send(
                new SignatureRequestMail($signature, $agreement, $user)
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send signature request email', [
                'signature_id' => $signature->id,
                'error' => $e->getMessage(),
            ]);
        }

        return response()->json($signature->load(['requester']), 201);
    }

    /**
     * Sign — submit a signature (drawn on canvas).
     */
    public function sign(Request $request, Signature $signature): JsonResponse
    {
        $user = $request->user();

        if (!$this->canSign($user, $signature)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($signature->status !== 'requested') {
            return response()->json(['message' => 'This signature request is no longer pending.'], 422);
        }

        $validated = $request->validate([
            'signature_data' => ['required', 'string'], // base64 PNG from canvas
        ]);

        $signature->update([
            'status' => 'signed',
            'signature_data' => $validated['signature_data'],
            'signer_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'signed_at' => now(),
        ]);

        // Refresh the parent agreement's signature status
        $agreement = $signature->signable;
        if ($agreement instanceof AffiliationAgreement) {
            $agreement->refreshSignatureStatus();

            // If fully signed, auto-activate agreement
            if ($agreement->signature_status === 'fully_signed' && $agreement->status === 'pending_review') {
                $agreement->update(['status' => 'active']);
            }
        }

        return response()->json($signature);
    }

    /**
     * Reject a signature request.
     */
    public function reject(Request $request, Signature $signature): JsonResponse
    {
        $user = $request->user();

        if (!$this->canSign($user, $signature)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($signature->status !== 'requested') {
            return response()->json(['message' => 'This signature request is no longer pending.'], 422);
        }

        $validated = $request->validate([
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $signature->update([
            'status' => 'rejected',
            'rejection_reason' => $validated['reason'] ?? null,
            'rejected_at' => now(),
        ]);

        $agreement = $signature->signable;
        if ($agreement instanceof AffiliationAgreement) {
            $agreement->refreshSignatureStatus();
        }

        return response()->json($signature);
    }

    /**
     * Cancel a pending signature request (requester only).
     */
    public function cancel(Request $request, Signature $signature): JsonResponse
    {
        $user = $request->user();

        if ($signature->requested_by !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($signature->status !== 'requested') {
            return response()->json(['message' => 'Only pending requests can be cancelled.'], 422);
        }

        $signature->update(['status' => 'cancelled']);

        $agreement = $signature->signable;
        if ($agreement instanceof AffiliationAgreement) {
            $agreement->refreshSignatureStatus();
        }

        return response()->json($signature);
    }

    /**
     * Resend the signature request email.
     */
    public function resend(Request $request, Signature $signature): JsonResponse
    {
        $user = $request->user();

        if ($signature->requested_by !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($signature->status !== 'requested') {
            return response()->json(['message' => 'Only pending requests can be resent.'], 422);
        }

        $agreement = $signature->signable;

        try {
            Mail::to($signature->signer_email)->send(
                new SignatureRequestMail($signature, $agreement, $user)
            );
            return response()->json(['message' => 'Signature request resent.']);
        } catch (\Throwable $e) {
            Log::warning('Failed to resend signature request email', [
                'signature_id' => $signature->id,
                'error' => $e->getMessage(),
            ]);
            return response()->json(['message' => 'Failed to send email.'], 500);
        }
    }

    /**
     * Get pending signature requests for the current user.
     */
    public function myPending(Request $request): JsonResponse
    {
        $user = $request->user();

        $signatures = Signature::forUser($user)
            ->requested()
            ->with(['signable', 'requester'])
            ->orderBy('requested_at', 'desc')
            ->get();

        return response()->json(['data' => $signatures]);
    }

    // --- Authorization helpers ---

    private function canAccessAgreement($user, AffiliationAgreement $agreement): bool
    {
        if ($user->isAdmin()) return true;
        if ($user->isCoordinator()) {
            return $user->studentProfile?->university_id === $agreement->university_id;
        }
        if ($user->isSiteManager()) {
            return $user->managedSites()->where('id', $agreement->site_id)->exists();
        }
        return false;
    }

    private function canManageAgreement($user, AffiliationAgreement $agreement): bool
    {
        return $this->canAccessAgreement($user, $agreement);
    }

    private function canSign($user, Signature $signature): bool
    {
        if ($user->isAdmin()) return true;
        if ($signature->signer_id === $user->id) return true;
        if ($signature->signer_email === $user->email) return true;
        return false;
    }
}
