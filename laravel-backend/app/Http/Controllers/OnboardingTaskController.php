<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\OnboardingTask;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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
        } elseif ($user->isPreceptor()) {
            // Scope to tasks for applications in the preceptor's slots
            $slotIds = $user->preceptorSlots()->pluck('id');
            $query->whereHas('application.slot', fn($q) => $q->whereIn('id', $slotIds));
        } elseif ($user->isCoordinator() || $user->role === 'professor') {
            // Scope to tasks for students from the same university
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $studentIds = StudentProfile::where('university_id', $universityId)->pluck('user_id');
                $query->whereHas('application', fn($q) => $q->whereIn('student_id', $studentIds));
            }
        }
        // Admin sees all

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

    public function uploadFile(Request $request, OnboardingTask $task): JsonResponse
    {
        $user = $request->user();

        if ($task->application->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:20480'],
        ]);

        // Delete old file if exists
        if ($task->file_path && Storage::disk()->exists($task->file_path)) {
            Storage::disk()->delete($task->file_path);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("onboarding-tasks/{$task->application_id}", $fileName, config('filesystems.default'));

        $task->update([
            'file_path' => $path,
            'file_name' => $originalName,
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'task' => $task->fresh()->load(['completedBy', 'verifiedBy']),
            'message' => 'File uploaded successfully.',
        ]);
    }

    public function downloadFile(Request $request, OnboardingTask $task)
    {
        $user = $request->user();

        // Students can download their own, site managers can download for their sites
        $isOwner = $task->application->student_id === $user->id;
        $siteId = $task->application->slot->site_id;
        $isManager = $user->managedSites()->where('id', $siteId)->exists();

        if (!$isOwner && !$isManager && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!$task->file_path || !Storage::disk()->exists($task->file_path)) {
            return response()->json(['message' => 'No file found.'], 404);
        }

        $content = Storage::disk()->get($task->file_path);
        $mimeType = Storage::disk()->mimeType($task->file_path) ?? 'application/octet-stream';

        return response($content, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'attachment; filename="' . ($task->file_name ?? 'document') . '"');
    }

    public function applicationProgress(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        // Authorization: student who owns it, site manager, preceptor for the slot, coordinator, or admin
        if (!$this->canAccessApplicationProgress($user, $application)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

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

    private function canAccessApplicationProgress($user, Application $application): bool
    {
        if ($user->isAdmin()) return true;

        // Student who owns the application
        if ($application->student_id === $user->id) return true;

        $application->loadMissing('slot.site');
        $slot = $application->slot;

        // Site manager for the application's site
        if ($user->isSiteManager() && $slot->site->manager_id === $user->id) return true;

        // Preceptor for the slot
        if ($user->isPreceptor() && $slot->preceptor_id === $user->id) return true;

        // Coordinator (same university)
        if ($user->isCoordinator() || $user->role === 'professor') {
            $application->loadMissing('student.studentProfile');
            $studentUni = $application->student->studentProfile?->university_id;
            $userUni = $user->studentProfile?->university_id;
            if ($studentUni && $userUni && $studentUni === $userUni) return true;
        }

        return false;
    }
}
