<?php

namespace App\Http\Controllers;

use App\Models\RotationSite;
use App\Models\RotationSlot;
use App\Models\SiteInvite;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RotationSlotController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RotationSlot::with(['site', 'preceptor']);

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('specialty', 'ilike', "%{$search}%")
                  ->orWhereHas('site', function ($sq) use ($search) {
                      $sq->where('name', 'ilike', "%{$search}%")
                         ->orWhere('city', 'ilike', "%{$search}%");
                  });
            });
        }

        if ($request->filled('specialty')) {
            $query->where('specialty', 'ilike', "%{$request->input('specialty')}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('cost_type')) {
            $query->where('cost_type', $request->input('cost_type'));
        }

        $slots = $query->orderBy('start_date', 'asc')
            ->paginate($request->input('per_page', 20));

        return response()->json($slots);
    }

    public function show(RotationSlot $slot): JsonResponse
    {
        $slot->load(['site', 'preceptor', 'applications.student']);

        return response()->json($slot);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => ['required', 'uuid', 'exists:rotation_sites,id'],
            'specialty' => ['required', 'string', 'max:255'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'start_date' => ['required', 'date', 'after:today'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
            'requirements' => ['nullable', 'array'],
            'cost' => ['sometimes', 'numeric', 'min:0'],
            'cost_type' => ['sometimes', 'in:free,paid'],
            'preceptor_id' => ['nullable', 'uuid', 'exists:users,id'],
            'shift_schedule' => ['nullable', 'string', 'max:255'],
        ]);

        $slot = RotationSlot::create($validated);

        return response()->json($slot->load('site'), 201);
    }

    public function update(Request $request, RotationSlot $slot): JsonResponse
    {
        $validated = $request->validate([
            'specialty' => ['sometimes', 'string', 'max:255'],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'start_date' => ['sometimes', 'date'],
            'end_date' => ['sometimes', 'date', 'after:start_date'],
            'capacity' => ['sometimes', 'integer', 'min:1', 'max:50'],
            'requirements' => ['nullable', 'array'],
            'cost' => ['sometimes', 'numeric', 'min:0'],
            'cost_type' => ['sometimes', 'in:free,paid'],
            'status' => ['sometimes', 'in:open,filled,closed'],
            'preceptor_id' => ['nullable', 'uuid', 'exists:users,id'],
            'shift_schedule' => ['nullable', 'string', 'max:255'],
        ]);

        $slot->update($validated);

        return response()->json($slot);
    }

    public function destroy(RotationSlot $slot): JsonResponse
    {
        $slot->delete();

        return response()->json(['message' => 'Slot deleted successfully.']);
    }

    public function preceptors(Request $request): JsonResponse
    {
        $user = $request->user();

        // Site managers only see preceptors associated with their sites (via invites or slot assignments)
        if ($user->role === 'site_manager') {
            $siteIds = RotationSite::where('manager_id', $user->id)->pluck('id');

            // Preceptors from accepted invites
            $invitePreceptorIds = SiteInvite::whereIn('site_id', $siteIds)
                ->where('status', 'accepted')
                ->whereNotNull('accepted_by')
                ->pluck('accepted_by');

            // Preceptors from slot assignments
            $slotPreceptorIds = RotationSlot::whereIn('site_id', $siteIds)
                ->whereNotNull('preceptor_id')
                ->pluck('preceptor_id');

            $allIds = $invitePreceptorIds->merge($slotPreceptorIds)->unique();

            $preceptors = User::where('role', 'preceptor')
                ->where('is_active', true)
                ->whereIn('id', $allIds)
                ->select('id', 'first_name', 'last_name', 'email')
                ->orderBy('last_name')
                ->get();
        } else {
            $preceptors = User::where('role', 'preceptor')
                ->where('is_active', true)
                ->select('id', 'first_name', 'last_name', 'email')
                ->orderBy('last_name')
                ->get();
        }

        return response()->json(['preceptors' => $preceptors]);
    }

    public function myPreceptors(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get sites managed by this user
        $siteIds = RotationSite::where('manager_id', $user->id)->pluck('id');

        // Preceptors from slot assignments
        $slotPreceptorIds = RotationSlot::whereIn('site_id', $siteIds)
            ->whereNotNull('preceptor_id')
            ->pluck('preceptor_id');

        // Preceptors from accepted invites
        $invitePreceptorIds = SiteInvite::whereIn('site_id', $siteIds)
            ->where('status', 'accepted')
            ->whereNotNull('accepted_by')
            ->pluck('accepted_by');

        $allPreceptorIds = $slotPreceptorIds->merge($invitePreceptorIds)->unique();

        $preceptors = User::where('role', 'preceptor')
            ->where('is_active', true)
            ->whereIn('id', $allPreceptorIds)
            ->with(['preceptorSlots' => function ($q) use ($siteIds) {
                $q->whereIn('site_id', $siteIds)->with('site');
            }])
            ->orderBy('last_name')
            ->get()
            ->map(function ($preceptor) {
                return [
                    'id' => $preceptor->id,
                    'first_name' => $preceptor->first_name,
                    'last_name' => $preceptor->last_name,
                    'email' => $preceptor->email,
                    'phone' => $preceptor->phone,
                    'slots' => $preceptor->preceptorSlots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'title' => $slot->title,
                            'specialty' => $slot->specialty,
                            'status' => $slot->status,
                            'start_date' => $slot->start_date,
                            'end_date' => $slot->end_date,
                            'site_name' => $slot->site?->name,
                        ];
                    }),
                ];
            });

        return response()->json(['preceptors' => $preceptors]);
    }
}
