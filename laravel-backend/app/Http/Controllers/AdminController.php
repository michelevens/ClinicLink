<?php

namespace App\Http\Controllers;

use App\Mail\AccountApprovedMail;
use App\Mail\PasswordResetMail;
use App\Mail\WelcomeMail;
use App\Models\AuditLog;
use App\Models\RotationSite;
use App\Models\SiteInvite;
use App\Models\StudentProfile;
use App\Models\UniversityLicenseCode;
use App\Models\User;
use App\Notifications\PreceptorAssignedToSiteNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    public function createUser(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', 'unique:users', 'regex:/^[a-z0-9._-]+$/'],
            'role' => ['required', 'in:student,preceptor,site_manager,coordinator,professor,admin'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'university_id' => ['sometimes', 'nullable', 'exists:universities,id'],
            'program_id' => ['sometimes', 'nullable', 'exists:programs,id'],
            'site_ids' => ['sometimes', 'array'],
            'site_ids.*' => ['exists:rotation_sites,id'],
        ]);

        $tempPassword = Str::random(16);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'username' => $validated['username'] ?? null,
            'password' => Hash::make($tempPassword),
            'role' => $validated['role'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => true, // Admin-created users are pre-approved
            'onboarding_completed_at' => now(),
        ]);

        // Role-specific associations
        if (in_array($validated['role'], ['student', 'coordinator', 'professor']) && !empty($validated['university_id'])) {
            StudentProfile::create([
                'user_id' => $user->id,
                'university_id' => $validated['university_id'],
                'program_id' => $validated['program_id'] ?? null,
            ]);
        }

        if ($validated['role'] === 'site_manager' && !empty($validated['site_ids'])) {
            RotationSite::whereIn('id', $validated['site_ids'])->update(['manager_id' => $user->id]);
        }

        if ($validated['role'] === 'preceptor' && !empty($validated['university_id'])) {
            StudentProfile::create([
                'user_id' => $user->id,
                'university_id' => $validated['university_id'],
            ]);
        }

        // Assign preceptor to sites via auto-accepted invites
        if ($validated['role'] === 'preceptor' && !empty($validated['site_ids'])) {
            foreach ($validated['site_ids'] as $siteId) {
                SiteInvite::create([
                    'site_id' => $siteId,
                    'invited_by' => $request->user()->id,
                    'token' => Str::random(48),
                    'email' => $user->email,
                    'status' => 'accepted',
                    'accepted_by' => $user->id,
                    'accepted_at' => now(),
                    'expires_at' => now()->addDays(30),
                ]);
            }
        }

        // Send welcome email with password reset link
        $emailSent = false;
        try {
            $resetToken = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($resetToken), 'created_at' => now()],
            );
            $resetUrl = config('app.frontend_url')
                . '/reset-password?token=' . $resetToken . '&email=' . urlencode($user->email);

            Mail::to($user->email)->send(new WelcomeMail($user, $resetUrl));
            $emailSent = true;
        } catch (\Throwable $e) {
            report($e);
        }

        $user->load('studentProfile');

        AuditLog::recordFromRequest('User', $user->id, 'created', $request, newValues: [
            'email' => $user->email,
            'role' => $user->role,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
        ]);

        $message = $emailSent
            ? 'User created and welcome email sent.'
            : 'User created successfully. Welcome email could not be sent — user can use forgot password to set up their account.';

        return response()->json(['user' => $user, 'message' => $message], 201);
    }

    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('username', 'ilike', "%{$search}%")
                  ->orWhere('system_id', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $query->with([
            'studentProfile.university:id,name',
            'managedSites:id,name,manager_id',
            'preceptorSlots:id,preceptor_id,site_id',
            'preceptorSlots.site:id,name',
        ]);

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        // Append affiliation for each user
        $users->getCollection()->transform(function ($user) {
            $affiliation = null;
            if (in_array($user->role, ['student', 'coordinator']) && $user->studentProfile?->university) {
                $affiliation = $user->studentProfile->university->name;
            } elseif ($user->role === 'site_manager' && $user->managedSites->isNotEmpty()) {
                $affiliation = $user->managedSites->first()->name;
            } elseif ($user->role === 'preceptor' && $user->preceptorSlots->isNotEmpty()) {
                $site = $user->preceptorSlots->first()->site;
                $affiliation = $site?->name;
            }
            $user->setAttribute('affiliation', $affiliation);
            // Clean up eager-loaded relations from response
            $user->unsetRelation('studentProfile');
            $user->unsetRelation('managedSites');
            $user->unsetRelation('preceptorSlots');
            return $user;
        });

        return response()->json($users);
    }

    public function showUser(User $user): JsonResponse
    {
        try {
            $relations = [];

            switch ($user->role) {
                case 'student':
                    $relations = [
                        'studentProfile.university',
                        'studentProfile.program',
                        'credentials',
                        'applications.slot.site',
                        'hourLogs',
                        'evaluationsAsStudent.slot',
                        'evaluationsAsStudent.preceptor',
                        'matchingPreferences',
                    ];
                    break;
                case 'preceptor':
                    $relations = [
                        'preceptorProfile',
                        'preceptorSlots.site',
                        'evaluationsAsPreceptor.student',
                        'evaluationsAsPreceptor.slot',
                        'preceptorReviewsReceived.student',
                    ];
                    break;
                case 'site_manager':
                    $relations = [
                        'managedSites',
                    ];
                    break;
                case 'coordinator':
                case 'professor':
                    $relations = [
                        'studentProfile.university',
                        'studentProfile.program',
                    ];
                    break;
            }

            $user->load($relations);
        } catch (\Throwable $e) {
            \Log::error('Failed to load user relations', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        // For preceptors, attach associated sites from accepted invites
        try {
            if ($user->role === 'preceptor') {
                $siteIds = SiteInvite::where('accepted_by', $user->id)
                    ->where('status', 'accepted')
                    ->pluck('site_id')
                    ->unique();

                $user->setAttribute('assigned_sites', RotationSite::whereIn('id', $siteIds)
                    ->select('id', 'name', 'city', 'state', 'specialties')
                    ->get());
            }

            // For site managers, load sites with their slots and preceptors for a richer view
            if ($user->role === 'site_manager') {
                $user->load('managedSites.slots.preceptor');
            }
        } catch (\Throwable $e) {
            \Log::error('Failed to load site data', ['user_id' => $user->id, 'error' => $e->getMessage()]);
        }

        try {
            $stats = [
                'applications_count' => $user->applications()->count(),
                'hour_logs_count' => $user->hourLogs()->count(),
                'total_hours' => (float) $user->hourLogs()->where('status', 'approved')->sum('hours_worked'),
                'evaluations_as_student' => $user->evaluationsAsStudent()->count(),
                'evaluations_as_preceptor' => $user->evaluationsAsPreceptor()->count(),
                'managed_sites_count' => $user->managedSites()->count(),
                'preceptor_slots_count' => $user->preceptorSlots()->count(),
                'reviews_received_count' => $user->preceptorReviewsReceived()->count(),
                'average_rating' => round((float) $user->preceptorReviewsReceived()->avg('overall_score'), 1),
                'messages_sent_count' => $user->sentMessages()->count(),
                'conversations_count' => $user->conversations()->count(),
                'total_students_mentored' => $user->preceptorProfile?->total_students_mentored ?? 0,
                'total_hours_supervised' => (float) ($user->preceptorProfile?->total_hours_supervised ?? 0),
            ];
        } catch (\Throwable $e) {
            \Log::warning('Failed to compute user stats', ['user_id' => $user->id, 'error' => $e->getMessage()]);
            $stats = [];
        }

        return response()->json([
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', 'unique:users,username,' . $user->id, 'regex:/^[a-z0-9._-]+$/'],
            'role' => ['sometimes', 'in:student,preceptor,site_manager,coordinator,professor,admin'],
            'is_active' => ['sometimes', 'boolean'],
            'plan' => ['sometimes', 'in:free,pro'],
            'stripe_onboarded' => ['sometimes', 'boolean'],
        ]);

        // Detect activation: is_active changing from false to true
        $wasInactive = !$user->is_active;
        $beingActivated = isset($validated['is_active']) && $validated['is_active'] === true;

        $oldValues = $user->only(array_keys($validated));
        $user->update($validated);

        // Detect role change for specific audit event
        if (isset($validated['role']) && $oldValues['role'] !== $validated['role']) {
            AuditLog::recordFromRequest('User', $user->id, 'role_changed', $request, metadata: [
                'old_role' => $oldValues['role'],
                'new_role' => $validated['role'],
            ]);
        }

        AuditLog::recordFromRequest('User', $user->id, 'updated', $request,
            oldValues: $oldValues,
            newValues: $user->only(array_keys($validated)),
        );

        // Send approval email when user is activated
        if ($wasInactive && $beingActivated) {
            try {
                $loginUrl = config('app.frontend_url') . '/login';
                Mail::to($user->email)->send(new AccountApprovedMail($user, $loginUrl));
            } catch (\Throwable $e) {
                Log::error('Failed to send approval email to ' . $user->email . ': ' . $e->getMessage());
            }

            // Auto-accept any pending site invites matching this user's email
            $pendingInvites = SiteInvite::whereRaw('LOWER(email) = ?', [strtolower($user->email)])
                ->where('status', 'pending')
                ->where('expires_at', '>', now())
                ->get();

            foreach ($pendingInvites as $invite) {
                $alreadyAccepted = SiteInvite::where('site_id', $invite->site_id)
                    ->where('accepted_by', $user->id)
                    ->where('status', 'accepted')
                    ->exists();

                if (!$alreadyAccepted) {
                    $invite->update([
                        'status' => 'accepted',
                        'accepted_by' => $user->id,
                        'accepted_at' => now(),
                    ]);
                }
            }
        }

        return response()->json(['user' => $user]);
    }

    public function deleteUser(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account.'], 422);
        }

        AuditLog::recordFromRequest('User', $user->id, 'deleted', $request, oldValues: [
            'email' => $user->email,
            'role' => $user->role,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
        ]);

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function resetUserPassword(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot reset your own password from here. Use the profile settings instead.'], 422);
        }

        // Generate a random temporary password
        $temporaryPassword = Str::random(12);

        $user->update([
            'password' => Hash::make($temporaryPassword),
        ]);

        // Revoke all existing tokens so the user must log in with the new password
        $user->tokens()->delete();

        AuditLog::recordFromRequest('User', $user->id, 'password_reset', $request, metadata: [
            'target_user_id' => $user->id,
            'target_email' => $user->email,
        ]);

        $emailSent = false;
        try {
            Mail::to($user->email)->send(new PasswordResetMail($user, $temporaryPassword));
            $emailSent = true;
        } catch (\Throwable $e) {
            report($e);
        }

        $message = $emailSent
            ? 'Password has been reset and emailed to ' . $user->email . '.'
            : 'Password has been reset but email could not be sent. Please share the temporary password with the user directly.';

        return response()->json([
            'message' => $message,
            'temporary_password' => $temporaryPassword,
            'email_sent' => $emailSent,
        ]);
    }

    public function bulkInvite(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'emails' => ['required', 'array', 'min:1', 'max:200'],
            'emails.*' => ['required', 'email', 'max:255'],
            'role' => ['required', 'in:student,preceptor,site_manager,coordinator,professor,admin'],
            'university_id' => ['sometimes', 'nullable', 'exists:universities,id'],
            'program_id' => ['sometimes', 'nullable', 'exists:programs,id'],
            'site_ids' => ['sometimes', 'array'],
            'site_ids.*' => ['exists:rotation_sites,id'],
        ]);

        $role = $validated['role'];
        $universityId = $validated['university_id'] ?? null;
        $programId = $validated['program_id'] ?? null;
        $siteIds = $validated['site_ids'] ?? [];
        $frontendUrl = config('app.frontend_url');

        $results = [];
        $sent = 0;
        $skipped = 0;
        $failed = 0;

        // Deduplicate emails
        $emails = collect($validated['emails'])->map(fn ($e) => strtolower(trim($e)))->unique()->values();

        // Find existing users to skip
        $existingEmails = User::whereIn('email', $emails)->pluck('email')->map(fn ($e) => strtolower($e))->toArray();

        foreach ($emails as $email) {
            if (in_array($email, $existingEmails)) {
                $results[] = ['email' => $email, 'status' => 'skipped', 'reason' => 'User already exists'];
                $skipped++;
                continue;
            }

            try {
                $tempPassword = Str::random(16);
                $nameParts = explode('@', $email);
                $firstName = ucfirst($nameParts[0]);

                $user = User::create([
                    'first_name' => $firstName,
                    'last_name' => '',
                    'email' => $email,
                    'password' => Hash::make($tempPassword),
                    'role' => $role,
                    'is_active' => true,
                    'onboarding_completed_at' => now(),
                ]);

                // Role-specific associations
                if (in_array($role, ['student', 'coordinator', 'professor']) && $universityId) {
                    StudentProfile::create([
                        'user_id' => $user->id,
                        'university_id' => $universityId,
                        'program_id' => $role === 'student' ? $programId : null,
                    ]);
                }

                if ($role === 'preceptor' && $universityId) {
                    StudentProfile::create([
                        'user_id' => $user->id,
                        'university_id' => $universityId,
                    ]);
                }

                if ($role === 'site_manager' && !empty($siteIds)) {
                    RotationSite::whereIn('id', $siteIds)->update(['manager_id' => $user->id]);
                }

                // Assign preceptor to sites via auto-accepted invites
                if ($role === 'preceptor' && !empty($siteIds)) {
                    foreach ($siteIds as $siteId) {
                        SiteInvite::create([
                            'site_id' => $siteId,
                            'invited_by' => $request->user()->id,
                            'token' => Str::random(48),
                            'email' => $email,
                            'status' => 'accepted',
                            'accepted_by' => $user->id,
                            'accepted_at' => now(),
                            'expires_at' => now()->addDays(30),
                        ]);
                    }
                }

                // Send welcome email
                $resetToken = Str::random(64);
                DB::table('password_reset_tokens')->updateOrInsert(
                    ['email' => $user->email],
                    ['token' => Hash::make($resetToken), 'created_at' => now()],
                );
                $resetUrl = $frontendUrl . '/reset-password?token=' . $resetToken . '&email=' . urlencode($user->email);

                Mail::to($email)->send(new WelcomeMail($user, $resetUrl));
                $results[] = ['email' => $email, 'status' => 'sent'];
                $sent++;
            } catch (\Throwable $e) {
                Log::error("Bulk invite failed for {$email}: " . $e->getMessage());
                $results[] = ['email' => $email, 'status' => 'failed', 'reason' => 'Error creating user or sending email'];
                $failed++;
            }
        }

        return response()->json([
            'message' => "Bulk invite complete: {$sent} sent, {$skipped} skipped, {$failed} failed.",
            'summary' => ['sent' => $sent, 'skipped' => $skipped, 'failed' => $failed, 'total' => $emails->count()],
            'results' => $results,
        ], 201);
    }

    public function assignPreceptorToSites(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'preceptor') {
            return response()->json(['message' => 'User is not a preceptor.'], 422);
        }

        $validated = $request->validate([
            'site_ids' => ['required', 'array', 'min:1'],
            'site_ids.*' => ['uuid', 'exists:rotation_sites,id'],
        ]);

        $assigned = [];
        $skipped = [];

        foreach ($validated['site_ids'] as $siteId) {
            // Check if already associated (accepted invite or slot assignment)
            $alreadyAccepted = SiteInvite::where('site_id', $siteId)
                ->where('accepted_by', $user->id)
                ->where('status', 'accepted')
                ->exists();

            if ($alreadyAccepted) {
                $site = RotationSite::find($siteId);
                $skipped[] = $site?->name ?? $siteId;
                continue;
            }

            SiteInvite::create([
                'site_id' => $siteId,
                'invited_by' => $request->user()->id,
                'token' => Str::random(48),
                'email' => $user->email,
                'status' => 'accepted',
                'accepted_by' => $user->id,
                'accepted_at' => now(),
                'expires_at' => now()->addDays(30),
            ]);

            $site = RotationSite::find($siteId);
            $assigned[] = $site?->name ?? $siteId;
        }

        // Notify preceptor about each new site assignment
        foreach ($assigned as $siteName) {
            try {
                $site = RotationSite::where('name', $siteName)->first();
                if ($site) {
                    $user->notify(new PreceptorAssignedToSiteNotification($site));
                }
            } catch (\Throwable $e) {
                Log::warning('Failed to send site assignment notification: ' . $e->getMessage());
            }
        }

        $message = count($assigned) > 0
            ? 'Preceptor assigned to: ' . implode(', ', $assigned) . '.'
            : 'No new assignments made.';

        if (count($skipped) > 0) {
            $message .= ' Already associated with: ' . implode(', ', $skipped) . '.';
        }

        return response()->json(['message' => $message, 'assigned' => $assigned, 'skipped' => $skipped]);
    }

    public function removePreceptorFromSite(Request $request, User $user, RotationSite $site): JsonResponse
    {
        if ($user->role !== 'preceptor') {
            return response()->json(['message' => 'User is not a preceptor.'], 422);
        }

        // Revoke accepted invites for this preceptor at this site
        $revoked = SiteInvite::where('site_id', $site->id)
            ->where('accepted_by', $user->id)
            ->where('status', 'accepted')
            ->update(['status' => 'revoked']);

        if ($revoked === 0) {
            return response()->json(['message' => 'Preceptor is not associated with this site.'], 404);
        }

        return response()->json(['message' => "Preceptor removed from {$site->name}."]);
    }

    public function assignSiteManagerToSites(Request $request, User $user): JsonResponse
    {
        if ($user->role !== 'site_manager') {
            return response()->json(['message' => 'User is not a site manager.'], 422);
        }

        $validated = $request->validate([
            'site_ids' => ['required', 'array', 'min:1'],
            'site_ids.*' => ['uuid', 'exists:rotation_sites,id'],
        ]);

        $assigned = [];
        $skipped = [];

        foreach ($validated['site_ids'] as $siteId) {
            $site = RotationSite::find($siteId);
            if (!$site) continue;

            if ($site->manager_id === $user->id) {
                $skipped[] = $site->name;
                continue;
            }

            $site->manager_id = $user->id;
            $site->save();
            $assigned[] = $site->name;
        }

        $message = count($assigned) > 0
            ? 'Site manager assigned to: ' . implode(', ', $assigned) . '.'
            : 'No new assignments made.';

        if (count($skipped) > 0) {
            $message .= ' Already managing: ' . implode(', ', $skipped) . '.';
        }

        return response()->json(['message' => $message, 'assigned' => $assigned, 'skipped' => $skipped]);
    }

    public function removeSiteManagerFromSite(Request $request, User $user, RotationSite $site): JsonResponse
    {
        if ($user->role !== 'site_manager') {
            return response()->json(['message' => 'User is not a site manager.'], 422);
        }

        if ($site->manager_id !== $user->id) {
            return response()->json(['message' => 'This user is not the manager of this site.'], 404);
        }

        $site->manager_id = null;
        $site->save();

        return response()->json(['message' => "Site manager removed from {$site->name}."]);
    }

    public function assignManagerToSite(Request $request, RotationSite $site): JsonResponse
    {
        $validated = $request->validate([
            'manager_id' => ['required', 'uuid', 'exists:users,id'],
        ]);

        $manager = User::find($validated['manager_id']);
        if (!$manager || $manager->role !== 'site_manager') {
            return response()->json(['message' => 'Selected user is not a site manager.'], 422);
        }

        $site->manager_id = $manager->id;
        $site->save();

        return response()->json([
            'message' => "{$manager->first_name} {$manager->last_name} assigned as manager of {$site->name}.",
            'manager' => [
                'id' => $manager->id,
                'first_name' => $manager->first_name,
                'last_name' => $manager->last_name,
                'email' => $manager->email,
            ],
        ]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::with('actor:id,first_name,last_name,role');

        if ($request->filled('auditable_type')) {
            $query->where('auditable_type', $request->input('auditable_type'));
        }
        if ($request->filled('event_type')) {
            $query->where('event_type', $request->input('event_type'));
        }
        if ($request->filled('actor_id')) {
            $query->where('actor_id', $request->input('actor_id'));
        }
        if ($request->filled('date_from')) {
            $query->where('created_at', '>=', $request->input('date_from'));
        }
        if ($request->filled('date_to')) {
            $query->where('created_at', '<=', $request->input('date_to'));
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 50));

        return response()->json($logs);
    }

    public function testEmail(Request $request): JsonResponse
    {
        $request->validate([
            'to' => ['required', 'email'],
        ]);

        $to = $request->input('to');

        try {
            Mail::raw('This is a test email from ClinicLink. If you receive this, email delivery is working correctly.', function ($message) use ($to) {
                $message->to($to)
                    ->subject('ClinicLink - Email Test');
            });

            return response()->json([
                'message' => 'Test email sent successfully.',
                'to' => $to,
                'mailer' => config('mail.default'),
                'from' => config('mail.from.address'),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Email sending failed.',
                'error' => $e->getMessage(),
                'error_class' => get_class($e),
                'mailer' => config('mail.default'),
                'from' => config('mail.from.address'),
                'resend_key_set' => !empty(config('services.resend.key')),
            ], 500);
        }
    }

    public function seedUniversities(Request $request): JsonResponse
    {
        $exitCode = Artisan::call('scrape:universities', [
            '--source' => 'curated',
            '--with-programs' => true,
        ]);

        $output = Artisan::output();

        return response()->json([
            'message' => 'University seeding complete.',
            'exit_code' => $exitCode,
            'output' => $output,
        ]);
    }

    // --- University License Codes ---

    public function listLicenseCodes(Request $request): JsonResponse
    {
        $query = UniversityLicenseCode::with('university:id,name', 'createdBy:id,first_name,last_name')
            ->withCount('users');

        if ($request->filled('university_id')) {
            $query->where('university_id', $request->university_id);
        }

        $codes = $query->orderByDesc('created_at')->paginate(25);

        return response()->json($codes);
    }

    public function createLicenseCode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'university_id' => ['required', 'exists:universities,id'],
            'max_uses' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'expires_at' => ['sometimes', 'nullable', 'date', 'after:now'],
            'count' => ['sometimes', 'integer', 'min:1', 'max:500'],
        ]);

        $count = $validated['count'] ?? 1;
        $codes = [];

        for ($i = 0; $i < $count; $i++) {
            $codes[] = UniversityLicenseCode::create([
                'university_id' => $validated['university_id'],
                'code' => strtoupper(Str::random(12)),
                'max_uses' => $validated['max_uses'] ?? 1,
                'expires_at' => $validated['expires_at'] ?? null,
                'is_active' => true,
                'created_by' => $request->user()->id,
            ]);
        }

        foreach ($codes as $code) {
            $code->load('university:id,name');
        }

        if ($count === 1) {
            return response()->json(['code' => $codes[0]], 201);
        }

        return response()->json(['codes' => $codes, 'count' => $count], 201);
    }

    public function deactivateLicenseCode(UniversityLicenseCode $code): JsonResponse
    {
        $code->update(['is_active' => false]);

        return response()->json(['message' => 'Code deactivated.', 'code' => $code]);
    }
}
