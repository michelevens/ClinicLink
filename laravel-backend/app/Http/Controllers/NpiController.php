<?php

namespace App\Http\Controllers;

use App\Models\PreceptorProfile;
use App\Models\RotationSite;
use App\Services\NpiLookupService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NpiController extends Controller
{
    public function __construct(
        private NpiLookupService $npiService
    ) {}

    /**
     * Look up a provider by NPI number (public, rate-limited).
     */
    public function lookup(Request $request): JsonResponse
    {
        $request->validate([
            'number' => ['required', 'string', 'regex:/^\d{10}$/'],
        ]);

        $result = $this->npiService->lookupByNumber($request->input('number'));

        return response()->json(['result' => $result]);
    }

    /**
     * Search NPPES by name (public, rate-limited).
     */
    public function search(Request $request): JsonResponse
    {
        $request->validate([
            'first_name' => ['sometimes', 'string', 'max:100'],
            'last_name' => ['sometimes', 'string', 'max:100'],
            'organization_name' => ['sometimes', 'string', 'max:200'],
            'state' => ['sometimes', 'string', 'max:2'],
            'type' => ['sometimes', 'in:individual,organization'],
        ]);

        $type = $request->input('type', 'individual');

        if ($type === 'organization') {
            $results = $this->npiService->searchOrganization(
                $request->input('organization_name', ''),
                $request->input('state')
            );
        } else {
            $results = $this->npiService->searchIndividual(
                $request->input('first_name', ''),
                $request->input('last_name', ''),
                $request->input('state')
            );
        }

        return response()->json(['results' => $results]);
    }

    /**
     * Verify and save NPI to the authenticated user's profile or site.
     */
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'npi_number' => ['required', 'string', 'regex:/^\d{10}$/'],
            'entity_type' => ['required', 'in:preceptor,site'],
            'site_id' => ['required_if:entity_type,site', 'sometimes', 'exists:rotation_sites,id'],
        ]);

        $user = $request->user();
        $npiNumber = $request->input('npi_number');

        // Look up the NPI
        $result = $this->npiService->lookupByNumber($npiNumber);

        if (!$result) {
            return response()->json([
                'verified' => false,
                'message' => 'NPI number not found in the NPPES registry.',
            ], 422);
        }

        $entityType = $request->input('entity_type');

        if ($entityType === 'preceptor') {
            // Check for duplicate
            $existing = PreceptorProfile::where('npi_number', $npiNumber)
                ->where('user_id', '!=', $user->id)
                ->exists();

            if ($existing) {
                return response()->json([
                    'verified' => false,
                    'message' => 'This NPI is already associated with another preceptor.',
                ], 409);
            }

            $profile = PreceptorProfile::where('user_id', $user->id)->first();

            if (!$profile) {
                return response()->json([
                    'verified' => false,
                    'message' => 'Preceptor profile not found.',
                ], 404);
            }

            $profile->update([
                'npi_number' => $npiNumber,
                'npi_verified_at' => now(),
                'npi_data' => $result,
            ]);
        } else {
            $site = RotationSite::findOrFail($request->input('site_id'));

            // Ensure the user manages this site
            if ($site->manager_id !== $user->id && $user->role !== 'admin') {
                return response()->json([
                    'verified' => false,
                    'message' => 'You do not manage this site.',
                ], 403);
            }

            // Check for duplicate
            $existing = RotationSite::where('npi_number', $npiNumber)
                ->where('id', '!=', $site->id)
                ->exists();

            if ($existing) {
                return response()->json([
                    'verified' => false,
                    'message' => 'This NPI is already associated with another site.',
                ], 409);
            }

            $site->update([
                'npi_number' => $npiNumber,
                'npi_verified_at' => now(),
                'npi_data' => $result,
            ]);
        }

        return response()->json([
            'verified' => true,
            'data' => $result,
        ]);
    }
}
