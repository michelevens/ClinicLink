<?php

namespace App\Http\Controllers\Collaborate;

use App\Http\Controllers\Controller;
use App\Models\PhysicianProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PhysicianProfileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = PhysicianProfile::with('user:id,first_name,last_name,email')
            ->where('is_active', true);

        if ($state = $request->query('state')) {
            $query->whereJsonContains('licensed_states', strtoupper($state));
        }

        if ($specialty = $request->query('specialty')) {
            $query->whereJsonContains('specialties', $specialty);
        }

        if ($model = $request->query('supervision_model')) {
            $query->where(function ($q) use ($model) {
                $q->where('supervision_model', $model)
                    ->orWhere('supervision_model', 'hybrid');
            });
        }

        $profiles = $query->paginate(20);

        $profiles->getCollection()->transform(function ($profile) {
            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'first_name' => $profile->user->first_name,
                'last_name' => $profile->user->last_name,
                'licensed_states' => $profile->licensed_states,
                'specialties' => $profile->specialties,
                'max_supervisees' => $profile->max_supervisees,
                'active_supervisees' => $profile->activeSuperviseeCount(),
                'has_capacity' => $profile->hasCapacity(),
                'supervision_model' => $profile->supervision_model,
                'malpractice_confirmed' => $profile->malpractice_confirmed,
                'bio' => $profile->bio,
            ];
        });

        return response()->json($profiles);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Gate 1: Must be a preceptor
        if ($user->role !== 'preceptor') {
            return response()->json([
                'message' => 'Only preceptors can create a physician profile.',
            ], 403);
        }

        // Gate 2: NPI must be verified
        $preceptorProfile = $user->preceptorProfile;
        if (!$preceptorProfile || !$preceptorProfile->npi_verified_at) {
            return response()->json([
                'message' => 'You must verify your NPI number before creating a physician profile.',
                'npi_required' => true,
            ], 422);
        }

        // Gate 3: NPI taxonomy must confirm MD/DO
        $taxonomies = collect(data_get($preceptorProfile->npi_data, 'taxonomies', []));
        $isMdDo = $taxonomies->contains(function ($t) {
            $code = $t['code'] ?? '';
            return str_starts_with($code, '207')
                || str_starts_with($code, '208')
                || $code === '171100000X';
        });

        if (!$isMdDo) {
            return response()->json([
                'message' => 'Your NPI taxonomy does not indicate MD or DO credentials. Only physicians (MD/DO) can create a supervising physician profile.',
                'taxonomy_mismatch' => true,
            ], 422);
        }

        if ($user->physicianProfile) {
            return response()->json(['message' => 'Profile already exists'], 409);
        }

        $validated = $request->validate([
            'licensed_states' => ['required', 'array', 'min:1'],
            'licensed_states.*' => ['string', 'size:2'],
            'specialties' => ['required', 'array', 'min:1'],
            'specialties.*' => ['string'],
            'max_supervisees' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'supervision_model' => ['required', 'in:in_person,telehealth,hybrid'],
            'malpractice_confirmed' => ['required', 'boolean'],
            'malpractice_document_url' => ['nullable', 'string'],
            'bio' => ['nullable', 'string', 'max:2000'],
        ]);

        $profile = PhysicianProfile::create([
            'user_id' => $user->id,
            ...$validated,
        ]);

        return response()->json($profile->load('user:id,first_name,last_name,email'), 201);
    }

    public function show(string $id): JsonResponse
    {
        $profile = PhysicianProfile::with('user:id,first_name,last_name,email')
            ->find($id);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return response()->json([
            'data' => [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'first_name' => $profile->user->first_name,
                'last_name' => $profile->user->last_name,
                'licensed_states' => $profile->licensed_states,
                'specialties' => $profile->specialties,
                'max_supervisees' => $profile->max_supervisees,
                'active_supervisees' => $profile->activeSuperviseeCount(),
                'has_capacity' => $profile->hasCapacity(),
                'supervision_model' => $profile->supervision_model,
                'malpractice_confirmed' => $profile->malpractice_confirmed,
                'bio' => $profile->bio,
                'is_active' => $profile->is_active,
                'created_at' => $profile->created_at,
                'updated_at' => $profile->updated_at,
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        $profile = PhysicianProfile::find($id);

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        if ($profile->user_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'licensed_states' => ['sometimes', 'array', 'min:1'],
            'licensed_states.*' => ['string', 'size:2'],
            'specialties' => ['sometimes', 'array', 'min:1'],
            'specialties.*' => ['string'],
            'max_supervisees' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'supervision_model' => ['sometimes', 'in:in_person,telehealth,hybrid'],
            'malpractice_confirmed' => ['sometimes', 'boolean'],
            'malpractice_document_url' => ['nullable', 'string'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $profile->update($validated);

        return response()->json($profile->fresh()->load('user:id,first_name,last_name,email'));
    }
}
