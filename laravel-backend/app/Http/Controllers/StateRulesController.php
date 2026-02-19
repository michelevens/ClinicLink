<?php

namespace App\Http\Controllers;

use App\Models\StateRule;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StateRulesController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = StateRule::query();

        if ($practiceLevel = $request->query('practice_level')) {
            $query->where('practice_level', $practiceLevel);
        }

        if ($request->boolean('supervision_required')) {
            $query->where('supervision_required', true);
        }

        $rules = $query->orderBy('state')->get();

        return response()->json(['data' => $rules]);
    }

    public function show(string $state): JsonResponse
    {
        $rule = StateRule::where('state', strtoupper($state))->first();

        if (!$rule) {
            return response()->json(['message' => 'State not found'], 404);
        }

        return response()->json(['data' => $rule]);
    }
}
