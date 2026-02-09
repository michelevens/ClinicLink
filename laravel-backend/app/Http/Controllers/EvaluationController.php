<?php

namespace App\Http\Controllers;

use App\Models\Evaluation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Evaluation::with(['student', 'preceptor', 'slot.site']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id)->submitted();
        } elseif ($user->isPreceptor()) {
            $query->where('preceptor_id', $user->id);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $evaluations = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($evaluations);
    }

    public function show(Evaluation $evaluation): JsonResponse
    {
        $evaluation->load(['student', 'preceptor', 'slot.site']);

        return response()->json($evaluation);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:mid_rotation,final,student_feedback'],
            'student_id' => ['required', 'uuid', 'exists:users,id'],
            'slot_id' => ['required', 'uuid', 'exists:rotation_slots,id'],
            'ratings' => ['required', 'array'],
            'comments' => ['nullable', 'string', 'max:5000'],
            'overall_score' => ['required', 'numeric', 'min:0', 'max:5'],
            'strengths' => ['nullable', 'string', 'max:2000'],
            'areas_for_improvement' => ['nullable', 'string', 'max:2000'],
            'is_submitted' => ['sometimes', 'boolean'],
        ]);

        $validated['preceptor_id'] = $request->user()->id;

        $evaluation = Evaluation::create($validated);

        return response()->json($evaluation->load(['student', 'slot.site']), 201);
    }

    public function update(Request $request, Evaluation $evaluation): JsonResponse
    {
        if ($evaluation->preceptor_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($evaluation->is_submitted) {
            return response()->json(['message' => 'Submitted evaluations cannot be edited.'], 422);
        }

        $validated = $request->validate([
            'ratings' => ['sometimes', 'array'],
            'comments' => ['nullable', 'string', 'max:5000'],
            'overall_score' => ['sometimes', 'numeric', 'min:0', 'max:5'],
            'strengths' => ['nullable', 'string', 'max:2000'],
            'areas_for_improvement' => ['nullable', 'string', 'max:2000'],
            'is_submitted' => ['sometimes', 'boolean'],
        ]);

        $evaluation->update($validated);

        return response()->json($evaluation);
    }
}
