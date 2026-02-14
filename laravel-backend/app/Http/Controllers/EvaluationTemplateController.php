<?php

namespace App\Http\Controllers;

use App\Models\EvaluationTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EvaluationTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EvaluationTemplate::with('university');

        if ($request->filled('university_id')) {
            $query->where('university_id', $request->input('university_id'));
        }

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        if ($request->boolean('active_only', false)) {
            $query->active();
        }

        $templates = $query->orderBy('created_at', 'desc')->get();

        return response()->json($templates);
    }

    public function show(EvaluationTemplate $template): JsonResponse
    {
        return response()->json($template->load('university'));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'university_id' => ['required', 'uuid', 'exists:universities,id'],
            'type' => ['required', 'in:mid_rotation,final,student_feedback'],
            'name' => ['required', 'string', 'max:255'],
            'categories' => ['required', 'array', 'min:1'],
            'categories.*.key' => ['required', 'string'],
            'categories.*.label' => ['required', 'string'],
            'categories.*.description' => ['nullable', 'string'],
            'categories.*.weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'categories.*.criteria' => ['nullable', 'array'],
            'categories.*.criteria.*.key' => ['required', 'string'],
            'categories.*.criteria.*.label' => ['required', 'string'],
            'categories.*.criteria.*.description' => ['nullable', 'string'],
            'rating_scale' => ['nullable', 'array', 'min:2'],
            'rating_scale.*.value' => ['required', 'numeric', 'min:0'],
            'rating_scale.*.label' => ['required', 'string'],
            'rating_scale.*.description' => ['nullable', 'string'],
        ]);

        // Deactivate existing template for same university + type
        EvaluationTemplate::where('university_id', $validated['university_id'])
            ->where('type', $validated['type'])
            ->active()
            ->update(['is_active' => false]);

        $validated['created_by'] = $request->user()->id;
        $validated['is_active'] = true;

        $template = EvaluationTemplate::create($validated);

        return response()->json($template->load('university'), 201);
    }

    public function update(Request $request, EvaluationTemplate $template): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'categories' => ['sometimes', 'array', 'min:1'],
            'categories.*.key' => ['required_with:categories', 'string'],
            'categories.*.label' => ['required_with:categories', 'string'],
            'categories.*.description' => ['nullable', 'string'],
            'categories.*.weight' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'categories.*.criteria' => ['nullable', 'array'],
            'categories.*.criteria.*.key' => ['required', 'string'],
            'categories.*.criteria.*.label' => ['required', 'string'],
            'categories.*.criteria.*.description' => ['nullable', 'string'],
            'rating_scale' => ['nullable', 'array', 'min:2'],
            'rating_scale.*.value' => ['required', 'numeric', 'min:0'],
            'rating_scale.*.label' => ['required', 'string'],
            'rating_scale.*.description' => ['nullable', 'string'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $template->update($validated);

        return response()->json($template);
    }

    public function destroy(EvaluationTemplate $template): JsonResponse
    {
        $template->delete();

        return response()->json(['message' => 'Template deleted.']);
    }
}
