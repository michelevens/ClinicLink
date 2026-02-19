<?php

namespace App\Http\Controllers\Collaborate;

use App\Http\Controllers\Controller;
use App\Models\CollaborationMatch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollaborationMatchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $physicianProfile = $user->physicianProfile;

        if ($physicianProfile) {
            // Physician sees incoming match requests
            $matches = CollaborationMatch::with([
                'request.user:id,first_name,last_name,email',
                'request',
            ])
                ->where('physician_profile_id', $physicianProfile->id)
                ->orderBy('match_score', 'desc')
                ->paginate(20);
        } else {
            // NP/PA sees their outgoing matches
            $matches = CollaborationMatch::with([
                'physicianProfile.user:id,first_name,last_name,email',
                'physicianProfile',
            ])
                ->whereHas('request', function ($q) use ($user) {
                    $q->where('user_id', $user->id);
                })
                ->orderBy('match_score', 'desc')
                ->paginate(20);
        }

        return response()->json($matches);
    }

    public function respond(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'status' => ['required', 'in:accepted,declined'],
        ]);

        $match = CollaborationMatch::with('physicianProfile')->find($id);

        if (!$match) {
            return response()->json(['message' => 'Match not found'], 404);
        }

        // Only the physician can respond to a match
        if (!$match->physicianProfile || $match->physicianProfile->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($match->status !== 'pending') {
            return response()->json(['message' => 'Match already responded to'], 422);
        }

        // Check capacity before accepting
        if ($validated['status'] === 'accepted' && !$match->physicianProfile->hasCapacity()) {
            return response()->json(['message' => 'Supervisee capacity reached'], 422);
        }

        $match->update([
            'status' => $validated['status'],
            'responded_at' => now(),
        ]);

        // If accepted, update the request status
        if ($validated['status'] === 'accepted') {
            $match->request()->update(['status' => 'matched']);
        }

        return response()->json($match->fresh()->load([
            'request.user:id,first_name,last_name',
            'physicianProfile.user:id,first_name,last_name',
        ]));
    }
}
