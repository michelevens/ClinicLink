<?php

namespace App\Http\Controllers;

use App\Mail\ApplicationStatusMail;
use App\Models\Application;
use App\Models\OnboardingTask;
use App\Models\RotationSlot;
use App\Notifications\ApplicationReviewedNotification;
use App\Notifications\NewApplicationNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Application::with(['student.studentProfile.university', 'student.studentProfile.program', 'slot.site', 'slot.preceptor', 'reviewer']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isSiteManager()) {
            $query->whereHas('slot.site', function ($q) use ($user) {
                $q->where('manager_id', $user->id);
            });
        } elseif ($user->isPreceptor()) {
            $query->whereHas('slot', function ($q) use ($user) {
                $q->where('preceptor_id', $user->id);
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $applications = $query->orderBy('submitted_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($applications);
    }

    public function show(Application $application): JsonResponse
    {
        $application->load(['student.studentProfile.university', 'student.studentProfile.program', 'student.credentials', 'slot.site', 'slot.preceptor', 'reviewer']);

        return response()->json($application);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'slot_id' => ['required', 'uuid', 'exists:rotation_slots,id'],
            'cover_letter' => ['nullable', 'string', 'max:5000'],
        ]);

        $slot = RotationSlot::findOrFail($validated['slot_id']);

        if (!$slot->hasAvailability()) {
            return response()->json(['message' => 'This rotation slot is full.'], 422);
        }

        $existing = Application::where('student_id', $request->user()->id)
            ->where('slot_id', $validated['slot_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already applied to this slot.'], 422);
        }

        $application = Application::create([
            'student_id' => $request->user()->id,
            'slot_id' => $validated['slot_id'],
            'cover_letter' => $validated['cover_letter'] ?? null,
            'submitted_at' => now(),
        ]);

        $application->load(['student', 'slot.site']);

        // Notify site manager
        if ($slot->site && $slot->site->manager) {
            $slot->site->manager->notify(new NewApplicationNotification($application));
        }

        return response()->json($application, 201);
    }

    public function review(Request $request, Application $application): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:accepted,declined,waitlisted'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $application->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'reviewed_at' => now(),
            'reviewed_by' => $request->user()->id,
        ]);

        if ($validated['status'] === 'accepted') {
            $slot = $application->slot;
            $slot->increment('filled');

            if ($slot->filled >= $slot->capacity) {
                $slot->update(['status' => 'filled']);
            }

            // Auto-create onboarding tasks from site's active template
            $site = $slot->site;
            $template = $site->onboardingTemplates()->where('is_active', true)->latest()->first();
            if ($template) {
                foreach ($template->items()->orderBy('order')->get() as $item) {
                    OnboardingTask::create([
                        'application_id' => $application->id,
                        'item_id' => $item->id,
                        'title' => $item->title,
                        'description' => $item->description,
                        'is_required' => $item->is_required,
                        'order' => $item->order,
                    ]);
                }
            }
        }

        $application->load(['student', 'slot.site']);

        // Email the student about the decision
        Mail::to($application->student->email)->send(
            new ApplicationStatusMail($application, $validated['status'])
        );

        // In-app notification for the student
        $application->student->notify(new ApplicationReviewedNotification($application, $validated['status']));

        return response()->json($application);
    }

    public function withdraw(Request $request, Application $application): JsonResponse
    {
        if ($application->student_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($application->status !== 'pending') {
            return response()->json(['message' => 'Only pending applications can be withdrawn.'], 422);
        }

        $application->update(['status' => 'withdrawn']);

        return response()->json($application);
    }
}
