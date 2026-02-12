<?php

namespace App\Http\Controllers;

use App\Mail\HourLogReviewedMail;
use App\Models\Application;
use App\Models\HourLog;
use App\Models\StudentProfile;
use App\Notifications\HourLogReviewedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class HourLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = HourLog::with(['student', 'slot.site', 'approver']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isPreceptor()) {
            $query->whereHas('slot', function ($q) use ($user) {
                $q->where('preceptor_id', $user->id);
            });
        } elseif ($user->isSiteManager()) {
            $query->whereHas('slot.site', function ($q) use ($user) {
                $q->where('manager_id', $user->id);
            });
        } elseif ($user->isCoordinator() || $user->role === 'professor') {
            // Scope to students from the same university
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $studentIds = StudentProfile::where('university_id', $universityId)->pluck('user_id');
                $query->whereIn('student_id', $studentIds);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('slot_id')) {
            $query->where('slot_id', $request->input('slot_id'));
        }

        $logs = $query->orderBy('date', 'desc')
            ->paginate($request->input('per_page', 30));

        return response()->json($logs);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isStudent()) {
            return response()->json(['message' => 'Only students can log hours.'], 403);
        }

        $validated = $request->validate([
            'slot_id' => ['required', 'uuid', 'exists:rotation_slots,id'],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'hours_worked' => ['required', 'numeric', 'min:0.5', 'max:24'],
            'category' => ['required', 'in:direct_care,indirect_care,simulation,observation,other'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        // Verify the student has an accepted application for this slot
        $hasAcceptedApp = Application::where('student_id', $user->id)
            ->where('slot_id', $validated['slot_id'])
            ->where('status', 'accepted')
            ->exists();

        if (!$hasAcceptedApp) {
            return response()->json(['message' => 'You do not have an accepted application for this slot.'], 403);
        }

        $validated['student_id'] = $user->id;

        $log = HourLog::create($validated);

        return response()->json($log->load('slot.site'), 201);
    }

    public function update(Request $request, HourLog $hourLog): JsonResponse
    {
        if ($hourLog->student_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($hourLog->status !== 'pending') {
            return response()->json(['message' => 'Only pending logs can be edited.'], 422);
        }

        $validated = $request->validate([
            'date' => ['sometimes', 'date', 'before_or_equal:today'],
            'hours_worked' => ['sometimes', 'numeric', 'min:0.5', 'max:24'],
            'category' => ['sometimes', 'in:direct_care,indirect_care,simulation,observation,other'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $hourLog->update($validated);

        return response()->json($hourLog);
    }

    public function review(Request $request, HourLog $hourLog): JsonResponse
    {
        $user = $request->user();

        if (!$this->canReviewHourLog($user, $hourLog)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:1000'],
        ]);

        $hourLog->update([
            'status' => $validated['status'],
            'approved_by' => $user->id,
            'approved_at' => now(),
            'rejection_reason' => $validated['rejection_reason'] ?? null,
        ]);

        if ($validated['status'] === 'approved') {
            $student = $hourLog->student;
            $profile = $student->studentProfile;
            if ($profile) {
                $profile->increment('hours_completed', $hourLog->hours_worked);
            }
        }

        $hourLog->load('student');

        // Email the student about the review
        Mail::to($hourLog->student->email)->send(
            new HourLogReviewedMail($hourLog, $validated['status'])
        );

        // In-app notification for the student
        $hourLog->student->notify(new HourLogReviewedNotification($hourLog, $validated['status']));

        return response()->json($hourLog);
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = HourLog::where('student_id', $user->id)->approved();

        $summary = [
            'total_hours' => $query->sum('hours_worked'),
            'by_category' => $query->selectRaw('category, SUM(hours_worked) as total')
                ->groupBy('category')
                ->pluck('total', 'category'),
            'pending_hours' => HourLog::where('student_id', $user->id)->pending()->sum('hours_worked'),
        ];

        $profile = $user->studentProfile;
        if ($profile) {
            $summary['platform_hours'] = $summary['total_hours'];
            $summary['prior_hours'] = $profile->prior_hours;
            $summary['total_hours'] = $profile->prior_hours + $summary['platform_hours'];
            $summary['hours_required'] = $profile->required_hours;
            $summary['hours_remaining'] = max(0, $summary['hours_required'] - $summary['total_hours']);
            $summary['progress_percent'] = $profile->hours_progress;
        }

        return response()->json($summary);
    }

    public function destroy(Request $request, HourLog $hourLog): JsonResponse
    {
        if ($hourLog->student_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($hourLog->status !== 'pending') {
            return response()->json(['message' => 'Only pending logs can be deleted.'], 422);
        }

        $hourLog->delete();

        return response()->json(['message' => 'Hour log deleted successfully.']);
    }

    private function canReviewHourLog($user, HourLog $hourLog): bool
    {
        if ($user->isAdmin()) return true;
        if ($user->isStudent()) return false;

        $hourLog->loadMissing('slot.site');
        $slot = $hourLog->slot;

        if ($user->isPreceptor() && $slot->preceptor_id === $user->id) return true;
        if ($user->isSiteManager() && $slot->site->manager_id === $user->id) return true;
        if ($user->isCoordinator()) return true;

        return false;
    }
}
