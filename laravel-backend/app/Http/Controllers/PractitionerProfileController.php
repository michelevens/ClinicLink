<?php

namespace App\Http\Controllers;

use App\Models\PractitionerProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PractitionerProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = PractitionerProfile::where('user_id', $request->user()->id)->first();

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        return response()->json($profile);
    }

    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'profession_type' => ['sometimes', 'in:np,pa'],
            'licensed_states' => ['sometimes', 'array', 'min:1'],
            'licensed_states.*' => ['string', 'size:2'],
            'primary_specialty' => ['sometimes', 'string'],
            'years_in_practice' => ['sometimes', 'integer', 'min:0'],
            'current_employer' => ['sometimes', 'nullable', 'string', 'max:255'],
            'npi_number' => ['sometimes', 'nullable', 'string', 'regex:/^\d{10}$/'],
            'license_numbers' => ['sometimes', 'nullable', 'array'],
            'malpractice_confirmed' => ['sometimes', 'boolean'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        $profile = PractitionerProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json($profile);
    }
}
