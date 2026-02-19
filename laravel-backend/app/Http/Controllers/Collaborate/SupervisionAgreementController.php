<?php

namespace App\Http\Controllers\Collaborate;

use App\Http\Controllers\Controller;
use App\Models\CollaborationMatch;
use App\Models\SupervisionAgreement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupervisionAgreementController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get agreements where user is either NP (via request) or physician (via match)
        $query = SupervisionAgreement::with([
            'collaborationMatch.request.user:id,first_name,last_name,email',
            'collaborationMatch.physicianProfile.user:id,first_name,last_name,email',
        ]);

        $physicianProfile = $user->physicianProfile;
        $practitionerProfile = $user->practitionerProfile;

        if ($physicianProfile) {
            // Physician sees agreements where they are the supervising physician
            $query->whereHas('collaborationMatch.physicianProfile', function ($q) use ($physicianProfile) {
                $q->where('id', $physicianProfile->id);
            });
        } elseif ($practitionerProfile || $user->role === 'practitioner') {
            // NP/PA sees agreements where they are the requester
            $query->whereHas('collaborationMatch.request', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });
        } else {
            // No access
            return response()->json(['data' => []]);
        }

        $agreements = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($agreements);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'collaboration_match_id' => ['required', 'uuid', 'exists:collaboration_matches,id'],
            'monthly_fee_cents' => ['required', 'integer', 'min:0'],
            'platform_fee_percent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
        ]);

        $match = CollaborationMatch::with(['request', 'physicianProfile'])->find($validated['collaboration_match_id']);

        if (!$match) {
            return response()->json(['message' => 'Match not found'], 404);
        }

        // Only the physician can create an agreement
        if (!$match->physicianProfile || $match->physicianProfile->user_id !== $user->id) {
            return response()->json(['message' => 'Only the physician can create an agreement'], 403);
        }

        // Match must be accepted
        if ($match->status !== 'accepted') {
            return response()->json(['message' => 'Match must be accepted before creating an agreement'], 422);
        }

        // Check if agreement already exists
        if ($match->supervisionAgreement) {
            return response()->json(['message' => 'Agreement already exists for this match'], 409);
        }

        $platformFeePercent = $validated['platform_fee_percent'] ?? 15.00;
        $platformFeeCents = (int) round(($validated['monthly_fee_cents'] * $platformFeePercent) / 100);

        $agreement = SupervisionAgreement::create([
            'collaboration_match_id' => $validated['collaboration_match_id'],
            'status' => 'draft',
            'monthly_fee_cents' => $validated['monthly_fee_cents'],
            'platform_fee_percent' => $platformFeePercent,
            'platform_fee_cents' => $platformFeeCents,
        ]);

        return response()->json($agreement->load([
            'collaborationMatch.request.user:id,first_name,last_name',
            'collaborationMatch.physicianProfile.user:id,first_name,last_name',
        ]), 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $agreement = SupervisionAgreement::with([
            'collaborationMatch.request.user:id,first_name,last_name,email',
            'collaborationMatch.physicianProfile.user:id,first_name,last_name,email',
        ])->find($id);

        if (!$agreement) {
            return response()->json(['message' => 'Agreement not found'], 404);
        }

        // Check ownership
        $physicianUserId = $agreement->collaborationMatch->physicianProfile->user_id ?? null;
        $npUserId = $agreement->collaborationMatch->request->user_id ?? null;

        if ($user->id !== $physicianUserId && $user->id !== $npUserId) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $agreement]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $agreement = SupervisionAgreement::with('collaborationMatch.physicianProfile')->find($id);

        if (!$agreement) {
            return response()->json(['message' => 'Agreement not found'], 404);
        }

        // Only physician can update
        if (!$agreement->collaborationMatch->physicianProfile || $agreement->collaborationMatch->physicianProfile->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Can only update if draft or pending_signature
        if (!in_array($agreement->status, ['draft', 'pending_signature'])) {
            return response()->json(['message' => 'Cannot update active or terminated agreements'], 422);
        }

        $validated = $request->validate([
            'monthly_fee_cents' => ['sometimes', 'integer', 'min:0'],
            'platform_fee_percent' => ['sometimes', 'numeric', 'min:0', 'max:100'],
            'billing_anchor' => ['sometimes', 'integer', 'min:1', 'max:28'],
        ]);

        if (isset($validated['monthly_fee_cents']) || isset($validated['platform_fee_percent'])) {
            $monthlyFee = $validated['monthly_fee_cents'] ?? $agreement->monthly_fee_cents;
            $platformPercent = $validated['platform_fee_percent'] ?? $agreement->platform_fee_percent;
            $validated['platform_fee_cents'] = (int) round(($monthlyFee * $platformPercent) / 100);
        }

        $agreement->update($validated);

        return response()->json($agreement->fresh());
    }

    public function activate(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $agreement = SupervisionAgreement::with([
            'collaborationMatch.physicianProfile',
            'collaborationMatch.request',
        ])->find($id);

        if (!$agreement) {
            return response()->json(['message' => 'Agreement not found'], 404);
        }

        // Only NP can activate (trigger payment)
        if ($agreement->collaborationMatch->request->user_id !== $user->id) {
            return response()->json(['message' => 'Only the practitioner can activate the agreement'], 403);
        }

        // Must be pending_signature
        if ($agreement->status !== 'pending_signature') {
            return response()->json(['message' => 'Agreement must be signed before activation'], 422);
        }

        // Check physician has Stripe Connect verified
        if (!$agreement->collaborationMatch->physicianProfile->hasStripeConnectVerified()) {
            return response()->json(['message' => 'Physician must complete Stripe Connect onboarding first'], 422);
        }

        $validated = $request->validate([
            'billing_anchor' => ['sometimes', 'integer', 'min:1', 'max:28'],
        ]);

        // TODO: Create Stripe subscription here
        // For now, mark as active

        $agreement->update([
            'status' => 'active',
            'activated_at' => now(),
            'billing_anchor' => $validated['billing_anchor'] ?? now()->day,
        ]);

        return response()->json($agreement->fresh());
    }

    public function pause(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $agreement = SupervisionAgreement::with('collaborationMatch.physicianProfile')->find($id);

        if (!$agreement) {
            return response()->json(['message' => 'Agreement not found'], 404);
        }

        // Only physician or admin can pause
        $isPhysician = $agreement->collaborationMatch->physicianProfile->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isPhysician && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($agreement->status !== 'active') {
            return response()->json(['message' => 'Can only pause active agreements'], 422);
        }

        $agreement->update([
            'status' => 'paused',
            'paused_at' => now(),
        ]);

        // TODO: Pause Stripe subscription

        return response()->json($agreement->fresh());
    }

    public function terminate(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $agreement = SupervisionAgreement::with([
            'collaborationMatch.physicianProfile',
            'collaborationMatch.request',
        ])->find($id);

        if (!$agreement) {
            return response()->json(['message' => 'Agreement not found'], 404);
        }

        $validated = $request->validate([
            'termination_reason' => ['required', 'string', 'max:1000'],
        ]);

        // NP, physician, or admin can terminate
        $isNp = $agreement->collaborationMatch->request->user_id === $user->id;
        $isPhysician = $agreement->collaborationMatch->physicianProfile->user_id === $user->id;
        $isAdmin = $user->role === 'admin';

        if (!$isNp && !$isPhysician && !$isAdmin) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($agreement->isTerminated()) {
            return response()->json(['message' => 'Agreement already terminated'], 422);
        }

        $agreement->update([
            'status' => 'terminated',
            'terminated_at' => now(),
            'termination_reason' => $validated['termination_reason'],
        ]);

        // TODO: Cancel Stripe subscription

        return response()->json($agreement->fresh());
    }
}
