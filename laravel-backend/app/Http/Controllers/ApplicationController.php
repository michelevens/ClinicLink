<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\RotationSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Application::with(['student', 'slot.site', 'reviewer']);

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
        $application->load(['student.studentProfile', 'student.credentials', 'slot.site', 'reviewer']);

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

        return response()->json($application->load('slot.site'), 201);
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
        }

        return response()->json($application->load(['student', 'slot']));
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
