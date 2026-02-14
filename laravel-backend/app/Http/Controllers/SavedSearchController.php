<?php

namespace App\Http\Controllers;

use App\Models\SavedSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedSearchController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $searches = SavedSearch::where('user_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($searches);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (SavedSearch::where('user_id', $user->id)->count() >= 10) {
            return response()->json(['message' => 'Maximum of 10 saved searches allowed.'], 422);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'filters' => ['required', 'array'],
            'alerts_enabled' => ['sometimes', 'boolean'],
        ]);

        $validated['user_id'] = $user->id;

        $search = SavedSearch::create($validated);

        return response()->json($search, 201);
    }

    public function update(Request $request, SavedSearch $savedSearch): JsonResponse
    {
        if ($savedSearch->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:100'],
            'alerts_enabled' => ['sometimes', 'boolean'],
        ]);

        $savedSearch->update($validated);

        return response()->json($savedSearch);
    }

    public function destroy(Request $request, SavedSearch $savedSearch): JsonResponse
    {
        if ($savedSearch->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $savedSearch->delete();

        return response()->json(['message' => 'Saved search deleted.']);
    }
}
