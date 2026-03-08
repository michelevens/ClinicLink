<?php

namespace App\Services;

use App\Models\ExclusionScreening;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SamGovScreeningService
{
    private const API_URL = 'https://api.sam.gov/entity-information/v4/exclusions';

    /**
     * Screen a single user against SAM.gov exclusions.
     */
    public function screenUser(User $user, ?User $screenedBy = null): ExclusionScreening
    {
        $apiKey = config('services.sam_gov.api_key');

        if (!$apiKey) {
            return ExclusionScreening::create([
                'user_id' => $user->id,
                'screened_by' => $screenedBy?->id,
                'source' => 'sam_gov',
                'result' => 'error',
                'notes' => 'SAM.gov API key not configured.',
            ]);
        }

        $matches = $this->findMatches($user, $apiKey);

        if (isset($matches['error'])) {
            return ExclusionScreening::create([
                'user_id' => $user->id,
                'screened_by' => $screenedBy?->id,
                'source' => 'sam_gov',
                'result' => 'error',
                'notes' => $matches['error'],
            ]);
        }

        if (empty($matches['records'])) {
            return ExclusionScreening::create([
                'user_id' => $user->id,
                'screened_by' => $screenedBy?->id,
                'source' => 'sam_gov',
                'match_type' => null,
                'result' => 'clear',
                'match_details' => null,
            ]);
        }

        $bestMatch = $matches['records'][0];

        return ExclusionScreening::create([
            'user_id' => $user->id,
            'screened_by' => $screenedBy?->id,
            'source' => 'sam_gov',
            'match_type' => $bestMatch['match_type'],
            'result' => 'match_found',
            'match_details' => $bestMatch['record'],
        ]);
    }

    /**
     * Screen multiple users. Returns array of screening results.
     */
    public function screenUsers(Collection $users, ?User $screenedBy = null): array
    {
        $results = [];
        foreach ($users as $user) {
            try {
                $results[] = $this->screenUser($user, $screenedBy);
            } catch (\Exception $e) {
                Log::warning("SAM.gov screening failed for user {$user->id}: {$e->getMessage()}");
                $results[] = ExclusionScreening::create([
                    'user_id' => $user->id,
                    'screened_by' => $screenedBy?->id,
                    'source' => 'sam_gov',
                    'result' => 'error',
                    'notes' => $e->getMessage(),
                ]);
            }
        }
        return $results;
    }

    /**
     * Search SAM.gov exclusions API for a user.
     * Tries name-based search.
     */
    private function findMatches(User $user, string $apiKey): array
    {
        $lastName = trim($user->last_name ?? '');
        $firstName = trim($user->first_name ?? '');

        if (!$lastName) {
            return ['records' => []];
        }

        $searchName = $firstName ? "{$lastName}, {$firstName}" : $lastName;

        try {
            $response = Http::timeout(30)
                ->get(self::API_URL, [
                    'api_key' => $apiKey,
                    'exclusionName' => $searchName,
                    'classification' => 'Individual',
                    'includeSections' => 'exclusionDetails,exclusionIdentification,exclusionActions',
                ]);

            if (!$response->successful()) {
                return ['error' => "SAM.gov API returned HTTP {$response->status()}"];
            }

            $data = $response->json();
            $results = $data['results'] ?? [];

            if (empty($results)) {
                return ['records' => []];
            }

            $matches = [];
            foreach ($results as $result) {
                $matchType = $this->determineMatchType($user, $result);
                if ($matchType) {
                    $matches[] = [
                        'match_type' => $matchType,
                        'record' => $this->formatResult($result),
                    ];
                }
            }

            // Sort by match strength
            $order = ['npi' => 0, 'name_exact' => 1, 'name_partial' => 2];
            usort($matches, fn($a, $b) => ($order[$a['match_type']] ?? 3) <=> ($order[$b['match_type']] ?? 3));

            return ['records' => $matches];
        } catch (\Exception $e) {
            Log::error("SAM.gov API error: {$e->getMessage()}");
            return ['error' => "SAM.gov API request failed: {$e->getMessage()}"];
        }
    }

    /**
     * Determine match type by comparing user data with SAM.gov result.
     */
    private function determineMatchType(User $user, array $result): ?string
    {
        $identification = $result['exclusionIdentification'] ?? [];
        $userLastName = strtoupper(trim($user->last_name ?? ''));
        $userFirstName = strtoupper(trim($user->first_name ?? ''));
        $resultLastName = strtoupper(trim($identification['lastName'] ?? ''));
        $resultFirstName = strtoupper(trim($identification['firstName'] ?? ''));

        // NPI match
        $npi = $user->preceptorProfile?->npi_number ?? $user->practitionerProfile?->npi_number;
        $resultNpi = $identification['npi'] ?? null;
        if ($npi && $resultNpi && $npi === $resultNpi) {
            return 'npi';
        }

        // Exact name match
        if ($userLastName === $resultLastName && $userFirstName && $userFirstName === $resultFirstName) {
            return 'name_exact';
        }

        // Partial name match (last name matches, first name starts with same letter)
        if ($userLastName === $resultLastName) {
            return 'name_partial';
        }

        return null;
    }

    /**
     * Format a SAM.gov API result for storage.
     */
    private function formatResult(array $result): array
    {
        $identification = $result['exclusionIdentification'] ?? [];
        $details = $result['exclusionDetails'] ?? [];
        $actions = $result['exclusionActions'] ?? [];
        $actionList = $actions['listOfActions'] ?? [];
        $latestAction = !empty($actionList) ? $actionList[0] : [];

        return [
            'lastname' => $identification['lastName'] ?? null,
            'firstname' => $identification['firstName'] ?? null,
            'middlename' => $identification['middleName'] ?? null,
            'entity_name' => $identification['entityName'] ?? null,
            'npi' => $identification['npi'] ?? null,
            'uei' => $identification['ueiSAM'] ?? null,
            'cage_code' => $identification['cageCode'] ?? null,
            'classification' => $details['classificationType'] ?? null,
            'exclusion_type' => $details['exclusionType'] ?? null,
            'exclusion_program' => $details['exclusionProgram'] ?? null,
            'excluding_agency' => $details['excludingAgencyName'] ?? null,
            'activate_date' => $latestAction['activateDate'] ?? null,
            'termination_date' => $latestAction['terminationDate'] ?? null,
            'record_status' => $latestAction['recordStatus'] ?? null,
            'source' => 'SAM.gov',
        ];
    }
}
