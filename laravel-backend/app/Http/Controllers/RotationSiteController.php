<?php

namespace App\Http\Controllers;

use App\Models\RotationSite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RotationSiteController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = RotationSite::with(['manager', 'slots'])
            ->active();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('city', 'ilike', "%{$search}%")
                  ->orWhere('state', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('specialty')) {
            $query->whereJsonContains('specialties', $request->input('specialty'));
        }

        if ($request->filled('state')) {
            $query->where('state', $request->input('state'));
        }

        $sites = $query->orderBy('rating', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($sites);
    }

    public function show(RotationSite $site): JsonResponse
    {
        $site->load(['manager', 'slots.preceptor', 'affiliationAgreements.university']);

        return response()->json($site);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'size:2'],
            'zip' => ['required', 'string', 'max:10'],
            'phone' => ['required', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:2000'],
            'specialties' => ['nullable', 'array'],
            'ehr_system' => ['nullable', 'string', 'max:255'],
        ]);

        if ($request->user()->isAdmin() && $request->filled('manager_id')) {
            $validated['manager_id'] = $request->input('manager_id');
        } else {
            $validated['manager_id'] = $request->user()->id;
        }

        $site = RotationSite::create($validated);

        return response()->json($site, 201);
    }

    public function update(Request $request, RotationSite $site): JsonResponse
    {
        if ($site->manager_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'address' => ['sometimes', 'string', 'max:500'],
            'city' => ['sometimes', 'string', 'max:255'],
            'state' => ['sometimes', 'string', 'size:2'],
            'zip' => ['sometimes', 'string', 'max:10'],
            'phone' => ['sometimes', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:500'],
            'description' => ['nullable', 'string', 'max:2000'],
            'specialties' => ['nullable', 'array'],
            'ehr_system' => ['nullable', 'string', 'max:255'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $site->update($validated);

        return response()->json($site);
    }

    public function destroy(Request $request, RotationSite $site): JsonResponse
    {
        if ($site->manager_id !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $site->delete();

        return response()->json(['message' => 'Site deleted successfully.']);
    }

    public function mySites(Request $request): JsonResponse
    {
        $sites = RotationSite::with('slots')
            ->where('manager_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($sites);
    }
}
