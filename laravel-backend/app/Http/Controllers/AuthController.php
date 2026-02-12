<?php

namespace App\Http\Controllers;

use App\Mail\WelcomeMail;
use App\Models\RotationSite;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'username' => $validated['username'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        // Generate a password reset token so the welcome email includes a "Change Password" link
        $resetToken = Str::random(64);
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            ['token' => Hash::make($resetToken), 'created_at' => now()],
        );
        $resetUrl = env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink')
            . '/reset-password?token=' . $resetToken . '&email=' . urlencode($user->email);

        // Send welcome email with password change link
        Mail::to($user->email)->send(new WelcomeMail($user, $resetUrl));

        $userData = $user->toArray();
        $userData['onboarding_completed'] = false;

        return response()->json([
            'user' => $userData,
            'token' => $token,
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

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        $userData = $user->toArray();
        $userData['onboarding_completed'] = !is_null($user->onboarding_completed_at);

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ]);
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
        $request->user()->currentAccessToken()->delete();

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
