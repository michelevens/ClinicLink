<?php

namespace App\Http\Controllers;

use App\Mail\NewUserRegistrationMail;
use App\Mail\RegistrationReceivedMail;
use App\Mail\WelcomeMail;
use App\Models\AuditLog;
use App\Models\RotationSite;
use App\Models\SiteInvite;
use App\Models\StudentProfile;
use App\Models\User;
use App\Notifications\NewUserRegisteredNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'username' => ['sometimes', 'nullable', 'string', 'max:50', 'unique:users', 'regex:/^[a-z0-9._-]+$/'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'in:student,preceptor,site_manager,coordinator,professor'],
            'university_id' => ['sometimes', 'nullable', 'exists:universities,id'],
            'program_id' => ['sometimes', 'nullable', 'exists:programs,id'],
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => trim($validated['email']),
            'username' => $validated['username'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'is_active' => false,
        ]);

        // Create student profile with university/program affiliation if provided
        if (!empty($validated['university_id']) && in_array($validated['role'], ['student', 'preceptor', 'coordinator', 'professor'])) {
            $profileData = [
                'user_id' => $user->id,
                'university_id' => $validated['university_id'],
            ];
            if (!empty($validated['program_id'])) {
                $profileData['program_id'] = $validated['program_id'];
            }
            StudentProfile::create($profileData);
        }

        // Send registration received email (account pending approval)
        try {
            Mail::to($user->email)->send(new RegistrationReceivedMail($user));
        } catch (\Throwable $e) {
            Log::error('Failed to send registration email to ' . $user->email . ': ' . $e->getMessage());
        }

        // Notify all admin users about the new registration (email + in-app)
        try {
            $admins = User::where('role', 'admin')->where('is_active', true)->get();
            $reviewUrl = env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink') . '/admin/users/' . $user->id;
            foreach ($admins as $admin) {
                Mail::to($admin->email)->send(new NewUserRegistrationMail($user, $reviewUrl));
                $admin->notify(new NewUserRegisteredNotification($user));
            }
        } catch (\Throwable $e) {
            Log::error('Failed to send admin notification for new user ' . $user->email . ': ' . $e->getMessage());
        }

        AuditLog::recordFromRequest('User', $user->id, 'registered', $request, metadata: [
            'role' => $validated['role'],
        ]);

        return response()->json([
            'message' => 'Registration submitted successfully. Your account is pending admin approval.',
            'pending_approval' => true,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'login' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $loginField = $validated['login'];

        // Determine login method: email, phone, or username
        $user = User::where('email', $loginField)
            ->orWhere('username', $loginField)
            ->orWhere('phone', $loginField)
            ->first();

        // Account lockout check
        if ($user && $user->isLocked()) {
            $minutesLeft = (int) now()->diffInMinutes($user->locked_until, false);
            AuditLog::record('User', $user->id, 'login_failed', null, 'public', metadata: [
                'login' => $loginField,
                'reason' => 'locked',
            ], ipAddress: $request->ip(), userAgent: substr((string) $request->userAgent(), 0, 500));
            return response()->json([
                'message' => "Account temporarily locked. Try again in {$minutesLeft} minutes.",
                'locked_until' => $user->locked_until,
            ], 429);
        }

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            if ($user) {
                $user->incrementFailedLogins();
                AuditLog::record('User', $user->id, 'login_failed', null, 'public', metadata: [
                    'login' => $loginField,
                    'reason' => 'invalid_credentials',
                ], ipAddress: $request->ip(), userAgent: substr((string) $request->userAgent(), 0, 500));
            }
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Your account is pending approval. You will receive an email once your account has been activated.',
                'pending_approval' => true,
            ], 403);
        }

        // Successful password check — reset lockout counter
        $user->resetFailedLogins();

        // MFA challenge: if user has MFA enabled, return a temporary token instead of a real session
        if ($user->mfa_enabled) {
            $mfaToken = Str::uuid()->toString();
            Cache::put('mfa_challenge:' . $mfaToken, $user->id, 300); // 5 minutes
            return response()->json([
                'mfa_required' => true,
                'mfa_token' => $mfaToken,
            ]);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        // Auto-accept any pending site invites matching this user's email
        $acceptedInvites = [];
        $pendingInvites = SiteInvite::whereRaw('LOWER(email) = ?', [strtolower($user->email)])
            ->where('status', 'pending')
            ->where('expires_at', '>', now())
            ->with('site:id,name')
            ->get();

        foreach ($pendingInvites as $invite) {
            // Skip if user already accepted an invite for this site
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
                $acceptedInvites[] = [
                    'site_id' => $invite->site->id,
                    'site_name' => $invite->site->name,
                ];
            }
        }

        AuditLog::record('User', $user->id, 'login', $user->id, $user->role, metadata: [
            'method' => filter_var($loginField, FILTER_VALIDATE_EMAIL) ? 'email' : (preg_match('/^\d/', $loginField) ? 'phone' : 'username'),
        ], ipAddress: $request->ip(), userAgent: substr((string) $request->userAgent(), 0, 500));

        $userData = $user->toArray();
        $userData['onboarding_completed'] = !is_null($user->onboarding_completed_at);

        $response = [
            'user' => $userData,
            'token' => $token,
        ];

        if (!empty($acceptedInvites)) {
            $response['accepted_invites'] = $acceptedInvites;
        }

        return response()->json($response);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->load(['studentProfile', 'credentials']);

        $data = $user->toArray();
        $data['onboarding_completed'] = !is_null($user->onboarding_completed_at);

        return response()->json($data);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->currentAccessToken()->delete();

        AuditLog::recordFromRequest('User', $user->id, 'logout', $request);

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'avatar_url' => ['sometimes', 'nullable', 'url', 'max:500'],
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    public function completeOnboarding(Request $request): JsonResponse
    {
        $user = $request->user();

        // Common: update phone
        if ($request->filled('phone')) {
            $user->update(['phone' => $request->input('phone')]);
        }

        // Role-specific saves
        switch ($user->role) {
            case 'student':
                StudentProfile::updateOrCreate(
                    ['user_id' => $user->id],
                    array_filter([
                        'graduation_date' => $request->input('graduation_date'),
                        'gpa' => $request->input('gpa') ? (float) $request->input('gpa') : null,
                        'clinical_interests' => $request->input('clinical_interests', []),
                        'bio' => $request->input('bio'),
                        'university_id' => $request->input('university_id'),
                        'program_id' => $request->input('program_id'),
                    ], fn ($v) => !is_null($v))
                );
                break;

            case 'site_manager':
                if ($request->filled('facility_name')) {
                    RotationSite::updateOrCreate(
                        ['manager_id' => $user->id],
                        [
                            'name' => $request->input('facility_name'),
                            'address' => $request->input('facility_address', ''),
                            'city' => $request->input('facility_city', ''),
                            'state' => $request->input('facility_state', ''),
                            'zip' => $request->input('facility_zip', ''),
                            'phone' => $request->input('facility_phone', ''),
                            'description' => $request->input('facility_description'),
                            'specialties' => $request->input('facility_specialties', []),
                            'ehr_system' => $request->input('ehr_system'),
                        ]
                    );
                }
                break;

            case 'preceptor':
                // Store specialties in a future preceptor_profiles table or as metadata
                break;

            case 'coordinator':
            case 'professor':
                if ($request->filled('university_id')) {
                    StudentProfile::updateOrCreate(
                        ['user_id' => $user->id],
                        array_filter([
                            'university_id' => $request->input('university_id'),
                            'program_id' => $request->input('program_id'),
                        ], fn ($v) => !is_null($v))
                    );
                }
                break;
        }

        // Mark onboarding as complete
        $user->update(['onboarding_completed_at' => now()]);

        $user->refresh();
        $userData = $user->toArray();
        $userData['onboarding_completed'] = true;

        return response()->json(['user' => $userData]);
    }
}
