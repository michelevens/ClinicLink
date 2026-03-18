<?php

namespace App\Http\Controllers;

use App\Models\PushDeviceToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PushTokenController extends Controller
{
    /**
     * Register or update a push device token.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string|max:500',
            'platform' => 'required|string|in:ios,android,web',
            'device_name' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        // Upsert: if token already exists (maybe for different user), reassign it
        $deviceToken = PushDeviceToken::updateOrCreate(
            ['token' => $validated['token']],
            [
                'user_id' => $user->id,
                'platform' => $validated['platform'],
                'device_name' => $validated['device_name'] ?? null,
                'is_active' => true,
                'last_used_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Push token registered.',
            'device_token' => $deviceToken,
        ]);
    }

    /**
     * Remove a push device token (logout / unregister).
     */
    public function destroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => 'required|string',
        ]);

        PushDeviceToken::where('token', $validated['token'])
            ->where('user_id', $request->user()->id)
            ->delete();

        return response()->json(['message' => 'Push token removed.']);
    }
}
