<?php

namespace App\Http\Controllers;

use App\Models\Credential;
use App\Models\StudentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller
{
    public function profile(Request $request): JsonResponse
    {
        $profile = $request->user()->studentProfile;

        if (!$profile) {
            return response()->json(['message' => 'No student profile found.'], 404);
        }

        $profile->load(['university', 'program']);

        return response()->json($profile);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'university_id' => ['nullable', 'uuid', 'exists:universities,id'],
            'program_id' => ['nullable', 'uuid', 'exists:programs,id'],
            'graduation_date' => ['nullable', 'date'],
            'gpa' => ['nullable', 'numeric', 'min:0', 'max:4.00'],
            'clinical_interests' => ['nullable', 'array'],
            'hours_required' => ['sometimes', 'integer', 'min:0'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'resume_url' => ['nullable', 'url', 'max:500'],
        ]);

        $profile = StudentProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($profile->load(['university', 'program']));
    }

    public function credentials(Request $request): JsonResponse
    {
        $credentials = $request->user()->credentials()
            ->orderBy('expiration_date', 'asc')
            ->get();

        return response()->json($credentials);
    }

    public function storeCredential(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:cpr,background_check,immunization,liability_insurance,drug_screen,license,hipaa,other'],
            'name' => ['required', 'string', 'max:255'],
            'expiration_date' => ['nullable', 'date'],
            'document_url' => ['nullable', 'url', 'max:500'],
        ]);

        $validated['user_id'] = $request->user()->id;

        $credential = Credential::create($validated);

        return response()->json($credential, 201);
    }

    public function updateCredential(Request $request, Credential $credential): JsonResponse
    {
        if ($credential->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'expiration_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:valid,expiring_soon,expired,pending'],
            'document_url' => ['nullable', 'url', 'max:500'],
        ]);

        $credential->update($validated);

        return response()->json($credential);
    }

    public function deleteCredential(Request $request, Credential $credential): JsonResponse
    {
        if ($credential->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $credential->delete();

        return response()->json(['message' => 'Credential deleted successfully.']);
    }
}
