<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;

class MfaController extends Controller
{
    private Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * GET /auth/mfa/status — Check if MFA is enabled for the authenticated user.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'mfa_enabled' => (bool) $user->mfa_enabled,
            'mfa_confirmed_at' => $user->mfa_confirmed_at,
            'backup_codes_remaining' => $user->mfa_backup_codes
                ? count(array_filter($user->mfa_backup_codes, fn ($c) => !($c['used'] ?? false)))
                : 0,
        ]);
    }

    /**
     * POST /auth/mfa/setup — Generate a new TOTP secret and provisioning URI.
     */
    public function setup(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->mfa_enabled) {
            return response()->json(['message' => 'MFA is already enabled. Disable it first to reconfigure.'], 422);
        }

        $secret = $this->google2fa->generateSecretKey();

        // Store secret on user (not yet confirmed)
        $user->update(['mfa_secret' => $secret]);

        $qrCodeUrl = $this->google2fa->getQRCodeUrl(
            config('app.name', 'ClinicLink'),
            $user->email,
            $secret
        );

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $qrCodeUrl,
        ]);
    }

    /**
     * POST /auth/mfa/confirm — Verify a TOTP code to enable MFA.
     */
    public function confirm(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if ($user->mfa_enabled) {
            return response()->json(['message' => 'MFA is already enabled.'], 422);
        }

        if (!$user->mfa_secret) {
            return response()->json(['message' => 'Please initiate MFA setup first.'], 422);
        }

        $valid = $this->google2fa->verifyKey($user->mfa_secret, $request->input('code'));

        if (!$valid) {
            return response()->json(['message' => 'Invalid verification code. Please try again.'], 422);
        }

        // Generate 8 backup codes
        $plainCodes = [];
        $hashedCodes = [];
        for ($i = 0; $i < 8; $i++) {
            $code = strtoupper(Str::random(4) . '-' . Str::random(4));
            $plainCodes[] = $code;
            $hashedCodes[] = ['hash' => Hash::make($code), 'used' => false];
        }

        $user->update([
            'mfa_enabled' => true,
            'mfa_confirmed_at' => now(),
            'mfa_backup_codes' => $hashedCodes,
        ]);

        return response()->json([
            'message' => 'Two-factor authentication has been enabled.',
            'backup_codes' => $plainCodes,
        ]);
    }

    /**
     * POST /auth/mfa/disable — Disable MFA (requires current password).
     */
    public function disable(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 422);
        }

        $user->update([
            'mfa_enabled' => false,
            'mfa_secret' => null,
            'mfa_confirmed_at' => null,
            'mfa_backup_codes' => null,
        ]);

        return response()->json([
            'message' => 'Two-factor authentication has been disabled.',
        ]);
    }

    /**
     * POST /auth/mfa/backup-codes — Regenerate backup codes (requires password).
     */
    public function backupCodes(Request $request): JsonResponse
    {
        $request->validate([
            'password' => ['required', 'string'],
        ]);

        $user = $request->user();

        if (!$user->mfa_enabled) {
            return response()->json(['message' => 'MFA is not enabled.'], 422);
        }

        if (!Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Incorrect password.'], 422);
        }

        $plainCodes = [];
        $hashedCodes = [];
        for ($i = 0; $i < 8; $i++) {
            $code = strtoupper(Str::random(4) . '-' . Str::random(4));
            $plainCodes[] = $code;
            $hashedCodes[] = ['hash' => Hash::make($code), 'used' => false];
        }

        $user->update(['mfa_backup_codes' => $hashedCodes]);

        return response()->json([
            'message' => 'Backup codes have been regenerated.',
            'backup_codes' => $plainCodes,
        ]);
    }

    /**
     * POST /auth/mfa/verify — Verify MFA code during login (public, uses mfa_token).
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'mfa_token' => ['required', 'string'],
            'code' => ['required', 'string'],
        ]);

        $mfaToken = $request->input('mfa_token');
        $cacheKey = 'mfa_challenge:' . $mfaToken;
        $userId = Cache::get($cacheKey);

        if (!$userId) {
            return response()->json(['message' => 'MFA session has expired. Please log in again.'], 401);
        }

        // Rate limit: track attempts
        $attemptsKey = 'mfa_attempts:' . $mfaToken;
        $attempts = (int) Cache::get($attemptsKey, 0);
        if ($attempts >= 5) {
            Cache::forget($cacheKey);
            return response()->json(['message' => 'Too many attempts. Please log in again.'], 429);
        }
        Cache::put($attemptsKey, $attempts + 1, 300);

        $user = \App\Models\User::find($userId);
        if (!$user) {
            return response()->json(['message' => 'User not found.'], 401);
        }

        $code = $request->input('code');
        $verified = false;

        // Try TOTP code first (6-digit)
        if (preg_match('/^\d{6}$/', $code)) {
            $verified = $this->google2fa->verifyKey($user->mfa_secret, $code);
        }

        // Try backup code if TOTP didn't match
        if (!$verified && $user->mfa_backup_codes) {
            $codes = $user->mfa_backup_codes;
            foreach ($codes as $i => $entry) {
                if (!($entry['used'] ?? false) && Hash::check($code, $entry['hash'])) {
                    $codes[$i]['used'] = true;
                    $user->update(['mfa_backup_codes' => $codes]);
                    $verified = true;
                    break;
                }
            }
        }

        if (!$verified) {
            return response()->json(['message' => 'Invalid verification code.'], 422);
        }

        // Clean up MFA challenge
        Cache::forget($cacheKey);
        Cache::forget($attemptsKey);

        // Issue real Sanctum token
        $token = $user->createToken('auth-token')->plainTextToken;

        $userData = $user->toArray();
        $userData['onboarding_completed'] = !is_null($user->onboarding_completed_at);

        return response()->json([
            'user' => $userData,
            'token' => $token,
        ]);
    }
}
