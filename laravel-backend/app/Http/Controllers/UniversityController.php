<?php

namespace App\Http\Controllers;

use App\Models\AffiliationAgreement;
use App\Models\University;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UniversityController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'size:2'],
            'zip' => ['nullable', 'string', 'max:10'],
            'phone' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:500'],
            'is_verified' => ['nullable', 'boolean'],
        ]);

        $university = University::create($validated);

        return response()->json($university->load('programs'), 201);
    }

    public function update(Request $request, University $university): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'size:2'],
            'zip' => ['nullable', 'string', 'max:10'],
            'phone' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:500'],
            'is_verified' => ['nullable', 'boolean'],
        ]);

        $university->update($validated);

        return response()->json($university->load('programs'));
    }

    public function destroy(Request $request, University $university): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($university->studentProfiles()->exists()) {
            return response()->json(['message' => 'Cannot delete university with enrolled students.'], 422);
        }

        $university->programs()->delete();
        $university->delete();

        return response()->json(['message' => 'University deleted successfully.']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = University::with('programs');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('city', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('state')) {
            $query->where('state', $request->input('state'));
        }

        $universities = $query->orderBy('name')
            ->paginate($request->input('per_page', 50));

        return response()->json($universities);
    }

    public function show(University $university): JsonResponse
    {
        $university->load(['programs', 'affiliationAgreements.site'])
            ->loadCount('studentProfiles');

        return response()->json($university);
    }

    public function programs(University $university): JsonResponse
    {
        return response()->json($university->programs);
    }

    public function agreements(Request $request): JsonResponse
    {
        $query = AffiliationAgreement::with(['university', 'site']);

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $agreements = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($agreements);
    }

    public function storeAgreement(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'university_id' => ['required', 'uuid', 'exists:universities,id'],
            'site_id' => ['required', 'uuid', 'exists:rotation_sites,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'document_url' => ['nullable', 'url', 'max:500'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $agreement = AffiliationAgreement::create($validated);

        return response()->json($agreement->load(['university', 'site']), 201);
    }

    public function updateAgreement(Request $request, AffiliationAgreement $agreement): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'in:draft,pending_review,active,expired,terminated'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'document_url' => ['nullable', 'url', 'max:500'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $agreement->update($validated);

        return response()->json($agreement->load(['university', 'site']));
    }
}
