<?php

namespace App\Http\Controllers;

use App\Mail\SiteInviteMail;
use App\Models\RotationSite;
use App\Models\SiteInvite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class SiteInviteController extends Controller
{
    /**
     * List invites for the site manager's sites.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $siteIds = RotationSite::where('manager_id', $user->id)->pluck('id');

        $invites = SiteInvite::whereIn('site_id', $siteIds)
            ->with(['site:id,name', 'acceptedByUser:id,first_name,last_name,email'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($invite) {
                return [
                    'id' => $invite->id,
                    'site_id' => $invite->site_id,
                    'site_name' => $invite->site?->name,
                    'token' => $invite->token,
                    'email' => $invite->email,
                    'status' => $invite->expires_at->isPast() && $invite->status === 'pending'
                        ? 'expired'
                        : $invite->status,
                    'accepted_by' => $invite->acceptedByUser ? [
                        'id' => $invite->acceptedByUser->id,
                        'name' => $invite->acceptedByUser->first_name . ' ' . $invite->acceptedByUser->last_name,
                        'email' => $invite->acceptedByUser->email,
                    ] : null,
                    'accepted_at' => $invite->accepted_at,
                    'expires_at' => $invite->expires_at,
                    'created_at' => $invite->created_at,
                ];
            });

        return response()->json(['invites' => $invites]);
    }

    /**
     * Create a new invite link.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'site_id' => ['required', 'uuid', 'exists:rotation_sites,id'],
            'email' => ['nullable', 'email', 'max:255'],
            'expires_in_days' => ['sometimes', 'integer', 'min:1', 'max:90'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        // Verify the user manages this site
        $site = RotationSite::where('id', $validated['site_id'])
            ->where('manager_id', $user->id)
            ->firstOrFail();

        $expiresInDays = $validated['expires_in_days'] ?? 30;

        $invite = SiteInvite::create([
            'site_id' => $site->id,
            'invited_by' => $user->id,
            'token' => Str::random(48),
            'email' => $validated['email'] ?? null,
            'status' => 'pending',
            'expires_at' => now()->addDays($expiresInDays),
        ]);

        $frontendUrl = env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink');
        $inviteUrl = $frontendUrl . '/invite/' . $invite->token;

        // Send invite email if an email address was provided
        $emailSent = false;
        if ($invite->email) {
            try {
                $inviterName = $user->first_name . ' ' . $user->last_name;
                $customMessage = $validated['message'] ?? null;
                Mail::to($invite->email)->send(new SiteInviteMail($site->name, $inviterName, $inviteUrl, $customMessage));
                $emailSent = true;
            } catch (\Throwable $e) {
                Log::error('Failed to send site invite email to ' . $invite->email . ': ' . $e->getMessage());
            }
        }

        return response()->json([
            'invite' => [
                'id' => $invite->id,
                'token' => $invite->token,
                'url' => $inviteUrl,
                'email' => $invite->email,
                'site_name' => $site->name,
                'expires_at' => $invite->expires_at,
                'email_sent' => $emailSent,
            ],
        ], 201);
    }

    /**
     * Bulk create invites from a list of emails.
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'site_id' => ['required', 'uuid', 'exists:rotation_sites,id'],
            'emails' => ['required', 'array', 'min:1', 'max:200'],
            'emails.*' => ['required', 'email', 'max:255'],
            'message' => ['nullable', 'string', 'max:2000'],
            'expires_in_days' => ['sometimes', 'integer', 'min:1', 'max:90'],
        ]);

        $site = RotationSite::where('id', $validated['site_id'])
            ->where('manager_id', $user->id)
            ->firstOrFail();

        $expiresInDays = $validated['expires_in_days'] ?? 30;
        $inviterName = $user->first_name . ' ' . $user->last_name;
        $customMessage = $validated['message'] ?? null;
        $frontendUrl = env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink');

        $results = [];
        $sent = 0;
        $failed = 0;
        $skipped = 0;

        // Deduplicate emails
        $emails = collect($validated['emails'])->map(fn ($e) => strtolower(trim($e)))->unique()->values();

        // Get existing pending/accepted invites for this site to skip duplicates
        $existingEmails = SiteInvite::where('site_id', $site->id)
            ->whereIn('status', ['pending', 'accepted'])
            ->whereIn('email', $emails)
            ->pluck('email')
            ->map(fn ($e) => strtolower($e))
            ->toArray();

        foreach ($emails as $email) {
            if (in_array($email, $existingEmails)) {
                $results[] = ['email' => $email, 'status' => 'skipped', 'reason' => 'Invite already exists'];
                $skipped++;
                continue;
            }

            $invite = SiteInvite::create([
                'site_id' => $site->id,
                'invited_by' => $user->id,
                'token' => Str::random(48),
                'email' => $email,
                'status' => 'pending',
                'expires_at' => now()->addDays($expiresInDays),
            ]);

            $inviteUrl = $frontendUrl . '/invite/' . $invite->token;

            try {
                Mail::to($email)->send(new SiteInviteMail($site->name, $inviterName, $inviteUrl, $customMessage));
                $results[] = ['email' => $email, 'status' => 'sent'];
                $sent++;
            } catch (\Throwable $e) {
                Log::error('Bulk invite email failed for ' . $email . ': ' . $e->getMessage());
                $results[] = ['email' => $email, 'status' => 'created', 'reason' => 'Email failed to send'];
                $failed++;
            }
        }

        return response()->json([
            'message' => "Bulk invite complete: {$sent} sent, {$skipped} skipped, {$failed} email failures.",
            'summary' => ['sent' => $sent, 'skipped' => $skipped, 'failed' => $failed, 'total' => $emails->count()],
            'results' => $results,
        ], 201);
    }

    /**
     * Get pending invites for the currently authenticated user (by email match).
     */
    public function myPendingInvites(Request $request): JsonResponse
    {
        $user = $request->user();

        $invites = SiteInvite::where('email', strtolower($user->email))
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->with(['site:id,name,address,city,state,specialties,description', 'inviter:id,first_name,last_name'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn ($invite) => [
                'id' => $invite->id,
                'token' => $invite->token,
                'email' => $invite->email,
                'site' => [
                    'id' => $invite->site->id,
                    'name' => $invite->site->name,
                    'city' => $invite->site->city,
                    'state' => $invite->site->state,
                    'specialties' => $invite->site->specialties ?? [],
                ],
                'invited_by' => $invite->inviter
                    ? $invite->inviter->first_name . ' ' . $invite->inviter->last_name
                    : null,
                'expires_at' => $invite->expires_at,
                'created_at' => $invite->created_at,
            ]);

        return response()->json(['invites' => $invites]);
    }

    /**
     * Public: validate an invite token and return site info.
     */
    public function show(string $token): JsonResponse
    {
        $invite = SiteInvite::where('token', $token)
            ->with(['site:id,name,address,city,state,specialties,description', 'inviter:id,first_name,last_name'])
            ->first();

        if (!$invite) {
            return response()->json(['message' => 'Invalid invite link.'], 404);
        }

        if ($invite->status === 'revoked') {
            return response()->json(['message' => 'This invite has been revoked.'], 410);
        }

        if ($invite->status === 'accepted') {
            return response()->json([
                'message' => 'This invite has already been accepted.',
                'already_accepted' => true,
                'site_name' => $invite->site->name ?? null,
            ], 200);
        }

        if ($invite->expires_at->isPast()) {
            return response()->json(['message' => 'This invite has expired.'], 410);
        }

        return response()->json([
            'invite' => [
                'id' => $invite->id,
                'email' => $invite->email,
                'site' => [
                    'id' => $invite->site->id,
                    'name' => $invite->site->name,
                    'address' => $invite->site->address,
                    'city' => $invite->site->city,
                    'state' => $invite->site->state,
                    'specialties' => $invite->site->specialties ?? [],
                    'description' => $invite->site->description,
                ],
                'invited_by' => $invite->inviter
                    ? $invite->inviter->first_name . ' ' . $invite->inviter->last_name
                    : null,
                'expires_at' => $invite->expires_at,
            ],
        ]);
    }

    /**
     * Accept an invite (authenticated preceptor).
     */
    public function accept(Request $request, string $token): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'preceptor') {
            return response()->json(['message' => 'Only preceptors can accept site invites.'], 403);
        }

        $invite = SiteInvite::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (!$invite) {
            return response()->json(['message' => 'Invalid or already used invite.'], 404);
        }

        if ($invite->expires_at->isPast()) {
            return response()->json(['message' => 'This invite has expired.'], 410);
        }

        // If email-specific, verify it matches
        if ($invite->email && strtolower($invite->email) !== strtolower($user->email)) {
            return response()->json(['message' => 'This invite was sent to a different email address.'], 403);
        }

        // Check if already accepted an invite for this site
        $existingAccepted = SiteInvite::where('site_id', $invite->site_id)
            ->where('accepted_by', $user->id)
            ->where('status', 'accepted')
            ->exists();

        if ($existingAccepted) {
            return response()->json(['message' => 'You are already associated with this site.'], 409);
        }

        $invite->update([
            'status' => 'accepted',
            'accepted_by' => $user->id,
            'accepted_at' => now(),
        ]);

        $invite->load('site:id,name');

        return response()->json([
            'message' => 'You have joined ' . $invite->site->name . '!',
            'site' => [
                'id' => $invite->site->id,
                'name' => $invite->site->name,
            ],
        ]);
    }

    /**
     * Resend an invite email.
     */
    public function resend(Request $request, SiteInvite $invite): JsonResponse
    {
        $user = $request->user();

        $site = RotationSite::where('id', $invite->site_id)
            ->where('manager_id', $user->id)
            ->firstOrFail();

        if ($invite->status !== 'pending') {
            return response()->json(['message' => 'Can only resend pending invites.'], 422);
        }

        if (!$invite->email) {
            return response()->json(['message' => 'Cannot resend an open invite — no email address.'], 422);
        }

        if ($invite->expires_at->isPast()) {
            // Extend expiration by 30 days
            $invite->update(['expires_at' => now()->addDays(30)]);
        }

        $frontendUrl = env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink');
        $inviteUrl = $frontendUrl . '/invite/' . $invite->token;
        $inviterName = $user->first_name . ' ' . $user->last_name;

        try {
            Mail::to($invite->email)->send(new SiteInviteMail($site->name, $inviterName, $inviteUrl, null));
            return response()->json(['message' => 'Invite resent to ' . $invite->email]);
        } catch (\Throwable $e) {
            Log::error('Resend invite failed for ' . $invite->email . ': ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send email.'], 500);
        }
    }

    /**
     * Revoke an invite.
     */
    public function destroy(Request $request, SiteInvite $invite): JsonResponse
    {
        $user = $request->user();

        // Verify manager owns the site
        $site = RotationSite::where('id', $invite->site_id)
            ->where('manager_id', $user->id)
            ->firstOrFail();

        if ($invite->status === 'accepted') {
            return response()->json(['message' => 'Cannot revoke an already accepted invite.'], 409);
        }

        $invite->update(['status' => 'revoked']);

        return response()->json(['message' => 'Invite revoked.']);
    }
}
