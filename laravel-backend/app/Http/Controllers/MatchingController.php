<?php

namespace App\Http\Controllers;

use App\Models\MatchingPreference;
use App\Services\MatchingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MatchingController extends Controller
{
    public function __construct(
        private MatchingService $matchingService
    ) {}

    /**
     * Get current student's matching preferences.
     */
    public function preferences(Request $request): JsonResponse
    {
        $prefs = $request->user()->matchingPreferences;

        return response()->json($prefs);
    }

    /**
     * Create or update matching preferences.
     */
    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'preferred_specialties' => ['sometimes', 'nullable', 'array'],
            'preferred_specialties.*' => ['string'],
            'preferred_states' => ['sometimes', 'nullable', 'array'],
            'preferred_states.*' => ['string', 'max:2'],
            'preferred_cities' => ['sometimes', 'nullable', 'array'],
            'preferred_cities.*' => ['string'],
            'max_distance_miles' => ['sometimes', 'nullable', 'integer', 'min:1'],
            'preferred_schedule' => ['sometimes', 'nullable', 'string', 'max:200'],
            'cost_preference' => ['sometimes', 'in:any,free_only,paid_ok'],
            'min_preceptor_rating' => ['sometimes', 'nullable', 'numeric', 'min:1', 'max:5'],
            'preferred_start_after' => ['sometimes', 'nullable', 'date'],
            'preferred_start_before' => ['sometimes', 'nullable', 'date'],
            'exclude_applied' => ['sometimes', 'boolean'],
        ]);

        $prefs = MatchingPreference::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($prefs);
    }

    /**
     * Run matching algorithm and return ranked results.
     */
    public function match(Request $request): JsonResponse
    {
        $limit = min((int) $request->query('limit', 20), 50);

        $results = $this->matchingService->matchForStudent($request->user(), $limit);

        $formatted = array_map(function ($result) {
            $slot = $result['slot'];
            return [
                'slot' => [
                    'id' => $slot->id,
                    'title' => $slot->title,
                    'specialty' => $slot->specialty,
                    'start_date' => $slot->start_date?->toDateString(),
                    'end_date' => $slot->end_date?->toDateString(),
                    'cost' => $slot->cost,
                    'cost_type' => $slot->cost_type,
                    'shift_schedule' => $slot->shift_schedule,
                    'capacity' => $slot->capacity,
                    'filled' => $slot->filled,
                    'site' => $slot->site ? [
                        'id' => $slot->site->id,
                        'name' => $slot->site->name,
                        'city' => $slot->site->city,
                        'state' => $slot->site->state,
                    ] : null,
                    'preceptor' => $slot->preceptor ? [
                        'id' => $slot->preceptor->id,
                        'first_name' => $slot->preceptor->first_name,
                        'last_name' => $slot->preceptor->last_name,
                    ] : null,
                ],
                'score' => $result['score'],
                'breakdown' => $result['breakdown'],
            ];
        }, $results);

        return response()->json(['results' => $formatted]);
    }
}
