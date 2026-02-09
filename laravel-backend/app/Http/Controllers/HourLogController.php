<?php

namespace App\Http\Controllers;

use App\Models\HourLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

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
        $validated = $request->validate([
            'slot_id' => ['required', 'uuid', 'exists:rotation_slots,id'],
            'date' => ['required', 'date', 'before_or_equal:today'],
            'hours_worked' => ['required', 'numeric', 'min:0.5', 'max:24'],
            'category' => ['required', 'in:direct_care,indirect_care,simulation,observation,other'],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $validated['student_id'] = $request->user()->id;

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
        $validated = $request->validate([
            'status' => ['required', 'in:approved,rejected'],
            'rejection_reason' => ['required_if:status,rejected', 'nullable', 'string', 'max:1000'],
        ]);

        $hourLog->update([
            'status' => $validated['status'],
            'approved_by' => $request->user()->id,
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

        return response()->json($hourLog->load('student'));
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
            $summary['hours_required'] = $profile->hours_required;
            $summary['hours_remaining'] = max(0, $profile->hours_required - $summary['total_hours']);
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
}
