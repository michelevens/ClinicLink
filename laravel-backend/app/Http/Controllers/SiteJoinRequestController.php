<?php

namespace App\Http\Controllers;

use App\Models\RotationSite;
use App\Models\SiteInvite;
use App\Models\SiteJoinRequest;
use App\Models\User;
use App\Notifications\SiteJoinRequestNotification;
use App\Notifications\SiteJoinRequestReviewedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SiteJoinRequestController extends Controller
{
    /**
     * Preceptor creates a join request for a site.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'site_id' => ['required', 'uuid', 'exists:rotation_sites,id'],
            'message' => ['nullable', 'string', 'max:1000'],
        ]);

        // Check for existing pending request
        $existing = SiteJoinRequest::where('site_id', $validated['site_id'])
            ->where('preceptor_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You already have a pending request for this site.'], 422);
        }

        // Check if already associated via accepted invite
        $alreadyLinked = SiteInvite::where('site_id', $validated['site_id'])
            ->where('accepted_by', $user->id)
            ->where('status', 'accepted')
            ->exists();

        if ($alreadyLinked) {
            return response()->json(['message' => 'You are already linked to this site.'], 422);
        }

        $joinRequest = SiteJoinRequest::create([
            'site_id' => $validated['site_id'],
            'preceptor_id' => $user->id,
            'message' => $validated['message'] ?? null,
        ]);

        $joinRequest->load('site', 'preceptor');

        // Notify site manager + admins
        try {
            $site = RotationSite::find($validated['site_id']);
            if ($site && $site->manager_id) {
                $manager = User::find($site->manager_id);
                $manager?->notify(new SiteJoinRequestNotification($joinRequest));
            }

            User::where('role', 'admin')->where('is_active', true)->each(function ($admin) use ($joinRequest) {
                $admin->notify(new SiteJoinRequestNotification($joinRequest));
            });
        } catch (\Throwable $e) {
            Log::warning('Failed to send join request notification: ' . $e->getMessage());
        }

        return response()->json(['join_request' => $joinRequest, 'message' => 'Join request submitted.'], 201);
    }

    /**
     * Preceptor views their own join requests.
     */
    public function myRequests(Request $request): JsonResponse
    {
        $requests = SiteJoinRequest::where('preceptor_id', $request->user()->id)
            ->with('site', 'reviewer')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['join_requests' => $requests]);
    }

    /**
     * Preceptor withdraws a pending request.
     */
    public function withdraw(Request $request, SiteJoinRequest $joinRequest): JsonResponse
    {
        if ($joinRequest->preceptor_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($joinRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be withdrawn.'], 422);
        }

        $joinRequest->update(['status' => 'withdrawn']);

        return response()->json(['message' => 'Request withdrawn.']);
    }

    /**
     * Site manager/admin views pending join requests for their sites.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = SiteJoinRequest::with('site', 'preceptor', 'reviewer')
            ->orderBy('created_at', 'desc');

        if ($user->isSiteManager()) {
            $siteIds = RotationSite::where('manager_id', $user->id)->pluck('id');
            $query->whereIn('site_id', $siteIds);
        }
        // Admins see all

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $requests = $query->get();

        return response()->json(['join_requests' => $requests]);
    }

    /**
     * Approve a join request — auto-creates an accepted SiteInvite.
     */
    public function approve(Request $request, SiteJoinRequest $joinRequest): JsonResponse
    {
        $user = $request->user();

        if (!$this->canReview($user, $joinRequest)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($joinRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be approved.'], 422);
        }

        $joinRequest->update([
            'status' => 'approved',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'review_notes' => $request->input('notes'),
        ]);

        // Auto-create accepted SiteInvite to link preceptor to site
        $preceptor = $joinRequest->preceptor;
        $alreadyAccepted = SiteInvite::where('site_id', $joinRequest->site_id)
            ->where('accepted_by', $preceptor->id)
            ->where('status', 'accepted')
            ->exists();

        if (!$alreadyAccepted) {
            SiteInvite::create([
                'site_id' => $joinRequest->site_id,
                'invited_by' => $user->id,
                'token' => Str::random(48),
                'email' => $preceptor->email,
                'status' => 'accepted',
                'accepted_by' => $preceptor->id,
                'accepted_at' => now(),
                'expires_at' => now()->addDays(30),
            ]);
        }

        // Notify the preceptor
        try {
            $joinRequest->load('site');
            $preceptor->notify(new SiteJoinRequestReviewedNotification($joinRequest, 'approved'));
        } catch (\Throwable $e) {
            Log::warning('Failed to send join request approval notification: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Join request approved. Preceptor has been linked to the site.']);
    }

    /**
     * Deny a join request.
     */
    public function deny(Request $request, SiteJoinRequest $joinRequest): JsonResponse
    {
        $user = $request->user();

        if (!$this->canReview($user, $joinRequest)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($joinRequest->status !== 'pending') {
            return response()->json(['message' => 'Only pending requests can be denied.'], 422);
        }

        $joinRequest->update([
            'status' => 'denied',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
            'review_notes' => $request->input('notes'),
        ]);

        // Notify the preceptor
        try {
            $joinRequest->load('site');
            $joinRequest->preceptor->notify(new SiteJoinRequestReviewedNotification($joinRequest, 'denied'));
        } catch (\Throwable $e) {
            Log::warning('Failed to send join request denial notification: ' . $e->getMessage());
        }

        return response()->json(['message' => 'Join request denied.']);
    }

    private function canReview(User $user, SiteJoinRequest $joinRequest): bool
    {
        if ($user->isAdmin()) return true;

        if ($user->isSiteManager()) {
            $joinRequest->loadMissing('site');
            return $joinRequest->site->manager_id === $user->id;
        }

        return false;
    }
}
