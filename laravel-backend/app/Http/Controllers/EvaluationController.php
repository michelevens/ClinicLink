<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Evaluation;
use App\Models\StudentProfile;
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
        } elseif ($user->isSiteManager()) {
            // Scope to evaluations for slots at sites managed by this user
            $siteIds = $user->managedSites()->pluck('id');
            $query->whereHas('slot', fn($q) => $q->whereIn('site_id', $siteIds));
        } elseif ($user->isCoordinator() || $user->role === 'professor') {
            // Scope to students from the same university
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $studentIds = StudentProfile::where('university_id', $universityId)->pluck('user_id');
                $query->whereIn('student_id', $studentIds);
            }
        }
        // Admin sees all

        if ($request->filled('type')) {
            $query->where('type', $request->input('type'));
        }

        $evaluations = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($evaluations);
    }

    public function show(Request $request, Evaluation $evaluation): JsonResponse
    {
        $user = $request->user();

        if (!$this->canAccessEvaluation($user, $evaluation)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $evaluation->load(['student', 'preceptor', 'slot.site']);

        return response()->json($evaluation);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only preceptor, site_manager, or admin can create evaluations
        if (!$user->isPreceptor() && !$user->isSiteManager() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'type' => ['required', 'in:mid_rotation,final,student_feedback'],
            'template_id' => ['nullable', 'uuid', 'exists:evaluation_templates,id'],
            'student_id' => ['required', 'uuid', 'exists:users,id'],
            'slot_id' => ['required', 'uuid', 'exists:rotation_slots,id'],
            'ratings' => ['required', 'array'],
            'comments' => ['nullable', 'string', 'max:5000'],
            'overall_score' => ['required', 'numeric', 'min:0', 'max:5'],
            'strengths' => ['nullable', 'string', 'max:2000'],
            'areas_for_improvement' => ['nullable', 'string', 'max:2000'],
            'is_submitted' => ['sometimes', 'boolean'],
        ]);

        // Verify the student has an accepted application for this slot
        $hasAcceptedApp = Application::where('student_id', $validated['student_id'])
            ->where('slot_id', $validated['slot_id'])
            ->where('status', 'accepted')
            ->exists();

        if (!$hasAcceptedApp) {
            return response()->json(['message' => 'Student does not have an accepted application for this slot.'], 422);
        }

        $validated['preceptor_id'] = $user->id;

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

    private function canAccessEvaluation($user, Evaluation $evaluation): bool
    {
        if ($user->isAdmin()) return true;

        // The student can see their own submitted evaluations
        if ($user->isStudent() && $evaluation->student_id === $user->id && $evaluation->is_submitted) return true;

        // The preceptor who created it
        if ($user->isPreceptor() && $evaluation->preceptor_id === $user->id) return true;

        // Site manager for the slot's site
        if ($user->isSiteManager()) {
            $evaluation->loadMissing('slot.site');
            if ($evaluation->slot->site->manager_id === $user->id) return true;
        }

        // Coordinator or professor for the same university
        if ($user->isCoordinator() || $user->role === 'professor') {
            $evaluation->loadMissing('student.studentProfile');
            $studentUni = $evaluation->student->studentProfile?->university_id;
            $userUni = $user->studentProfile?->university_id;
            if ($studentUni && $userUni && $studentUni === $userUni) return true;
        }

        return false;
    }
}
