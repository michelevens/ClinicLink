<?php

namespace App\Http\Controllers;

use App\Mail\StudentInviteMail;
use App\Models\StudentInvite;
use App\Models\StudentProfile;
use App\Models\University;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class StudentInviteController extends Controller
{
    /**
     * List invites for the coordinator's university.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $universityId = $user->university_id;

        if (!$universityId) {
            return response()->json(['invites' => []]);
        }

        $invites = StudentInvite::where('university_id', $universityId)
            ->with(['program:id,name', 'acceptedByUser:id,first_name,last_name,email'])
            ->orderByDesc('created_at')
            ->get()
            ->map(function ($invite) {
                return [
                    'id' => $invite->id,
                    'university_id' => $invite->university_id,
                    'program_id' => $invite->program_id,
                    'program_name' => $invite->program?->name,
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
     * Create a new student invite.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $universityId = $user->university_id;

        if (!$universityId) {
            return response()->json(['message' => 'You are not associated with a university.'], 422);
        }

        $validated = $request->validate([
            'email' => ['nullable', 'email', 'max:255'],
            'program_id' => ['nullable', 'uuid', 'exists:programs,id'],
            'expires_in_days' => ['sometimes', 'integer', 'min:1', 'max:90'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $university = University::findOrFail($universityId);
        $expiresInDays = $validated['expires_in_days'] ?? 30;

        $invite = StudentInvite::create([
            'university_id' => $universityId,
            'program_id' => $validated['program_id'] ?? null,
            'invited_by' => $user->id,
            'token' => Str::random(48),
            'email' => $validated['email'] ?? null,
            'status' => 'pending',
            'expires_at' => now()->addDays($expiresInDays),
        ]);

        $frontendUrl = config('app.frontend_url');
        $inviteUrl = $frontendUrl . '/student-invite/' . $invite->token;

        $emailSent = false;
        if ($invite->email) {
            try {
                $inviterName = $user->first_name . ' ' . $user->last_name;
                $customMessage = $validated['message'] ?? null;
                Mail::to($invite->email)->send(new StudentInviteMail(
                    $university->name,
                    $inviterName,
                    $inviteUrl,
                    $customMessage,
                ));
                $emailSent = true;
            } catch (\Throwable $e) {
                Log::error('Failed to send student invite email to ' . $invite->email . ': ' . $e->getMessage());
            }
        }

        return response()->json([
            'invite' => [
                'id' => $invite->id,
                'token' => $invite->token,
                'url' => $inviteUrl,
                'email' => $invite->email,
                'university_name' => $university->name,
                'expires_at' => $invite->expires_at,
                'email_sent' => $emailSent,
            ],
        ], 201);
    }

    /**
     * Bulk create student invites from a list of emails.
     */
    public function bulkStore(Request $request): JsonResponse
    {
        $user = $request->user();
        $universityId = $user->university_id;

        if (!$universityId) {
            return response()->json(['message' => 'You are not associated with a university.'], 422);
        }

        $validated = $request->validate([
            'emails' => ['required', 'array', 'min:1', 'max:200'],
            'emails.*' => ['required', 'email', 'max:255'],
            'program_id' => ['nullable', 'uuid', 'exists:programs,id'],
            'message' => ['nullable', 'string', 'max:2000'],
            'expires_in_days' => ['sometimes', 'integer', 'min:1', 'max:90'],
        ]);

        $university = University::findOrFail($universityId);
        $expiresInDays = $validated['expires_in_days'] ?? 30;
        $inviterName = $user->first_name . ' ' . $user->last_name;
        $customMessage = $validated['message'] ?? null;
        $frontendUrl = config('app.frontend_url');

        $results = [];
        $sent = 0;
        $failed = 0;
        $skipped = 0;

        $emails = collect($validated['emails'])->map(fn ($e) => strtolower(trim($e)))->unique()->values();

        // Skip existing pending/accepted invites for this university
        $existingEmails = StudentInvite::where('university_id', $universityId)
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

            $invite = StudentInvite::create([
                'university_id' => $universityId,
                'program_id' => $validated['program_id'] ?? null,
                'invited_by' => $user->id,
                'token' => Str::random(48),
                'email' => $email,
                'status' => 'pending',
                'expires_at' => now()->addDays($expiresInDays),
            ]);

            $inviteUrl = $frontendUrl . '/student-invite/' . $invite->token;

            try {
                Mail::to($email)->send(new StudentInviteMail(
                    $university->name,
                    $inviterName,
                    $inviteUrl,
                    $customMessage,
                ));
                $results[] = ['email' => $email, 'status' => 'sent'];
                $sent++;
            } catch (\Throwable $e) {
                Log::error('Bulk student invite email failed for ' . $email . ': ' . $e->getMessage());
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
     * Public: validate a student invite token.
     */
    public function show(string $token): JsonResponse
    {
        $invite = StudentInvite::where('token', $token)
            ->with(['university:id,name,city,state', 'program:id,name,degree_type', 'inviter:id,first_name,last_name'])
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
                'university_name' => $invite->university->name ?? null,
            ], 200);
        }

        if ($invite->expires_at->isPast()) {
            return response()->json(['message' => 'This invite has expired.'], 410);
        }

        return response()->json([
            'invite' => [
                'id' => $invite->id,
                'email' => $invite->email,
                'university' => [
                    'id' => $invite->university->id,
                    'name' => $invite->university->name,
                    'city' => $invite->university->city,
                    'state' => $invite->university->state,
                ],
                'program' => $invite->program ? [
                    'id' => $invite->program->id,
                    'name' => $invite->program->name,
                    'degree_type' => $invite->program->degree_type,
                ] : null,
                'invited_by' => $invite->inviter
                    ? $invite->inviter->first_name . ' ' . $invite->inviter->last_name
                    : null,
                'expires_at' => $invite->expires_at,
            ],
        ]);
    }

    /**
     * Accept a student invite (authenticated student).
     */
    public function accept(Request $request, string $token): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'student') {
            return response()->json(['message' => 'Only students can accept student invites.'], 403);
        }

        $invite = StudentInvite::where('token', $token)
            ->where('status', 'pending')
            ->first();

        if (!$invite) {
            return response()->json(['message' => 'Invalid or already used invite.'], 404);
        }

        if ($invite->expires_at->isPast()) {
            return response()->json(['message' => 'This invite has expired.'], 410);
        }

        if ($invite->email && strtolower($invite->email) !== strtolower($user->email)) {
            return response()->json(['message' => 'This invite was sent to a different email address.'], 403);
        }

        // Associate student with university
        $user->university_id = $invite->university_id;
        $user->save();

        // Create or update student profile
        $profile = StudentProfile::firstOrCreate(
            ['user_id' => $user->id],
            [
                'university_id' => $invite->university_id,
                'program_id' => $invite->program_id,
            ]
        );

        if ($profile->wasRecentlyCreated === false) {
            $profile->update([
                'university_id' => $invite->university_id,
                'program_id' => $invite->program_id ?? $profile->program_id,
            ]);
        }

        $invite->update([
            'status' => 'accepted',
            'accepted_by' => $user->id,
            'accepted_at' => now(),
        ]);

        $invite->load('university:id,name');

        return response()->json([
            'message' => 'You have joined ' . $invite->university->name . '!',
            'university' => [
                'id' => $invite->university->id,
                'name' => $invite->university->name,
            ],
        ]);
    }

    /**
     * Resend a student invite email.
     */
    public function resend(Request $request, StudentInvite $invite): JsonResponse
    {
        $user = $request->user();

        if ($invite->university_id !== $user->university_id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($invite->status !== 'pending') {
            return response()->json(['message' => 'Can only resend pending invites.'], 422);
        }

        if (!$invite->email) {
            return response()->json(['message' => 'Cannot resend an open invite — no email address.'], 422);
        }

        if ($invite->expires_at->isPast()) {
            $invite->update(['expires_at' => now()->addDays(30)]);
        }

        $university = University::findOrFail($invite->university_id);
        $frontendUrl = config('app.frontend_url');
        $inviteUrl = $frontendUrl . '/student-invite/' . $invite->token;
        $inviterName = $user->first_name . ' ' . $user->last_name;

        try {
            Mail::to($invite->email)->send(new StudentInviteMail($university->name, $inviterName, $inviteUrl, null));
            return response()->json(['message' => 'Invite resent to ' . $invite->email]);
        } catch (\Throwable $e) {
            Log::error('Resend student invite failed for ' . $invite->email . ': ' . $e->getMessage());
            return response()->json(['message' => 'Failed to send email.'], 500);
        }
    }

    /**
     * Revoke a student invite.
     */
    public function destroy(Request $request, StudentInvite $invite): JsonResponse
    {
        $user = $request->user();

        if ($invite->university_id !== $user->university_id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($invite->status === 'accepted') {
            return response()->json(['message' => 'Cannot revoke an already accepted invite.'], 409);
        }

        $invite->update(['status' => 'revoked']);

        return response()->json(['message' => 'Invite revoked.']);
    }
}
