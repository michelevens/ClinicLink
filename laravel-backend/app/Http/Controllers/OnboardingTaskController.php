<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\OnboardingTask;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingTaskController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = OnboardingTask::with([
            'application.student',
            'application.slot.site',
            'completedBy',
            'verifiedBy',
        ]);

        if ($user->isStudent()) {
            $applicationIds = Application::where('student_id', $user->id)
                ->where('status', 'accepted')
                ->pluck('id');
            $query->whereIn('application_id', $applicationIds);
        } elseif ($user->isSiteManager()) {
            $siteIds = $user->managedSites()->pluck('id');
            $query->whereHas('application.slot.site', fn($q) => $q->whereIn('id', $siteIds));
        }

        if ($request->filled('application_id')) {
            $query->where('application_id', $request->input('application_id'));
        }

        $tasks = $query->orderBy('order')->get();

        return response()->json(['tasks' => $tasks]);
    }

    public function complete(Request $request, OnboardingTask $task): JsonResponse
    {
        $user = $request->user();

        if ($task->application->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $task->update([
            'completed_at' => now(),
            'completed_by' => $user->id,
        ]);

        return response()->json([
            'task' => $task->fresh()->load(['completedBy', 'verifiedBy']),
        ]);
    }

    public function uncomplete(Request $request, OnboardingTask $task): JsonResponse
    {
        $user = $request->user();

        if ($task->application->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($task->verified_at) {
            return response()->json(['message' => 'Cannot uncomplete a verified task.'], 422);
        }

        $task->update([
            'completed_at' => null,
            'completed_by' => null,
        ]);

        return response()->json(['task' => $task->fresh()]);
    }

    public function verify(Request $request, OnboardingTask $task): JsonResponse
    {
        $validated = $request->validate([
            'verification_notes' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $siteId = $task->application->slot->site_id;

        if (!$user->managedSites()->where('id', $siteId)->exists() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!$task->completed_at) {
            return response()->json(['message' => 'Task must be completed before verification.'], 422);
        }

        $task->update([
            'verified_at' => now(),
            'verified_by' => $user->id,
            'verification_notes' => $validated['verification_notes'] ?? null,
        ]);

        return response()->json([
            'task' => $task->fresh()->load(['completedBy', 'verifiedBy']),
        ]);
    }

    public function unverify(Request $request, OnboardingTask $task): JsonResponse
    {
        $user = $request->user();
        $siteId = $task->application->slot->site_id;

        if (!$user->managedSites()->where('id', $siteId)->exists() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $task->update([
            'verified_at' => null,
            'verified_by' => null,
            'verification_notes' => null,
        ]);

        return response()->json(['task' => $task->fresh()]);
    }

    public function applicationProgress(Application $application): JsonResponse
    {
        $tasks = $application->onboardingTasks;
        $requiredTasks = $tasks->where('is_required', true);
        $requiredCount = $requiredTasks->count();
        $completedRequired = $requiredTasks->whereNotNull('completed_at')->count();
        $verifiedRequired = $requiredTasks->whereNotNull('verified_at')->count();

        return response()->json([
            'total_tasks' => $tasks->count(),
            'required_tasks' => $requiredCount,
            'completed_required' => $completedRequired,
            'verified_required' => $verifiedRequired,
            'progress_percentage' => $requiredCount > 0 ? round(($completedRequired / $requiredCount) * 100) : 100,
            'all_required_completed' => $requiredCount > 0 ? $requiredTasks->every(fn($t) => $t->completed_at !== null) : true,
            'all_required_verified' => $requiredCount > 0 ? $requiredTasks->every(fn($t) => $t->verified_at !== null) : true,
        ]);
    }
}
