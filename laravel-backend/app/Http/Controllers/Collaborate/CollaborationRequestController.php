<?php

namespace App\Http\Controllers\Collaborate;

use App\Http\Controllers\Controller;
use App\Models\CollaborationMatch;
use App\Models\CollaborationRequest;
use App\Services\CollaborationMatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CollaborationRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = CollaborationRequest::where('user_id', $user->id)
            ->withCount('matches');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        $requests = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($requests);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only practitioners (practicing NPs/PAs) can create collaboration requests
        if ($user->role !== 'practitioner') {
            return response()->json([
                'message' => 'Only practicing NPs and PAs can create collaboration requests.',
            ], 403);
        }

        $validated = $request->validate([
            'profession_type' => ['required', 'in:np,pa'],
            'states_requested' => ['required', 'array', 'min:1'],
            'states_requested.*' => ['string', 'size:2'],
            'specialty' => ['required', 'string'],
            'practice_model' => ['required', 'in:telehealth,in_person,hybrid'],
            'expected_start_date' => ['required', 'date', 'after:today'],
            'preferred_supervision_model' => ['nullable', 'in:in_person,telehealth,hybrid'],
        ]);

        $collabRequest = CollaborationRequest::create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        // Auto-run matching engine
        $matchingService = new CollaborationMatchingService();
        $matches = $matchingService->findMatches($collabRequest);

        foreach ($matches as $match) {
            CollaborationMatch::create([
                'request_id' => $collabRequest->id,
                'physician_profile_id' => $match['profile']->id,
                'status' => 'pending',
                'match_score' => $match['score'],
                'match_reasons' => $match['reasons'],
            ]);
        }

        return response()->json(
            $collabRequest->load('matches.physicianProfile.user:id,first_name,last_name'),
            201
        );
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $collabRequest = CollaborationRequest::with([
            'matches.physicianProfile.user:id,first_name,last_name,email',
        ])->find($id);

        if (!$collabRequest) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($collabRequest->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return response()->json(['data' => $collabRequest]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        $collabRequest = CollaborationRequest::find($id);

        if (!$collabRequest) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if ($collabRequest->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:open,closed'],
        ]);

        $collabRequest->update($validated);

        return response()->json($collabRequest);
    }
}
