<?php

namespace App\Http\Controllers;

use App\Mail\AccountApprovedMail;
use App\Mail\PasswordResetMail;
use App\Mail\WelcomeMail;
use App\Models\RotationSite;
use App\Models\SiteInvite;
use App\Models\StudentProfile;
use App\Models\User;
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

        // Send welcome email with password reset link
        $emailSent = false;
        try {
            $resetToken = Str::random(64);
            DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                ['token' => Hash::make($resetToken), 'created_at' => now()],
            );
            $resetUrl = env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink')
                . '/reset-password?token=' . $resetToken . '&email=' . urlencode($user->email);

            Mail::to($user->email)->send(new WelcomeMail($user, $resetUrl));
            $emailSent = true;
        } catch (\Throwable $e) {
            report($e);
        }

        $user->load('studentProfile');

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
                  ->orWhere('username', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($users);
    }

    public function showUser(User $user): JsonResponse
    {
        $relations = [];

        switch ($user->role) {
            case 'student':
                $relations = [
                    'studentProfile',
                    'credentials',
                    'applications.slot.site',
                    'hourLogs',
                    'evaluationsAsStudent.slot',
                    'evaluationsAsStudent.preceptor',
                ];
                break;
            case 'preceptor':
                $relations = [
                    'preceptorSlots.site',
                    'evaluationsAsPreceptor.student',
                    'evaluationsAsPreceptor.slot',
                ];
                break;
            case 'site_manager':
                $relations = [
                    'managedSites',
                ];
                break;
        }

        $user->load($relations);

        $stats = [
            'applications_count' => $user->applications()->count(),
            'hour_logs_count' => $user->hourLogs()->count(),
            'total_hours' => (float) $user->hourLogs()->where('status', 'approved')->sum('hours_worked'),
            'evaluations_as_student' => $user->evaluationsAsStudent()->count(),
            'evaluations_as_preceptor' => $user->evaluationsAsPreceptor()->count(),
            'managed_sites_count' => $user->managedSites()->count(),
            'preceptor_slots_count' => $user->preceptorSlots()->count(),
        ];

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
        ]);

        // Detect activation: is_active changing from false to true
        $wasInactive = !$user->is_active;
        $beingActivated = isset($validated['is_active']) && $validated['is_active'] === true;

        $user->update($validated);

        // Send approval email when user is activated
        if ($wasInactive && $beingActivated) {
            try {
                $loginUrl = env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink') . '/login';
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
        $frontendUrl = env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink');

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
}
