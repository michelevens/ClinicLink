<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NpiLookupService
{
    private const API_URL = 'https://npiregistry.cms.hhs.gov/api/';
    private const CACHE_TTL = 86400; // 24 hours

    /**
     * Look up a provider by NPI number.
     */
    public function lookupByNumber(string $npi): ?array
    {
        $cacheKey = "npi:number:{$npi}";

        return Cache::remember($cacheKey, self::CACHE_TTL, function () use ($npi) {
            $response = Http::timeout(10)->get(self::API_URL, [
                'version' => '2.1',
                'number' => $npi,
            ]);

            if (!$response->successful()) {
                Log::warning("NPI lookup failed for {$npi}", ['status' => $response->status()]);
                return null;
            }

            $data = $response->json();

            if (($data['result_count'] ?? 0) === 0) {
                return null;
            }

            return $this->normalizeResult($data['results'][0]);
        });
    }

    /**
     * Search for individual providers by name.
     */
    public function searchIndividual(string $firstName, string $lastName, ?string $state = null): array
    {
        $params = [
            'version' => '2.1',
            'enumeration_type' => 'NPI-1',
            'first_name' => $firstName,
            'last_name' => $lastName,
            'limit' => 10,
        ];

        if ($state) {
            $params['state'] = $state;
        }

        return $this->search($params);
    }

    /**
     * Search for organizations by name.
     */
    public function searchOrganization(string $orgName, ?string $state = null): array
    {
        $params = [
            'version' => '2.1',
            'enumeration_type' => 'NPI-2',
            'organization_name' => $orgName,
            'limit' => 10,
        ];

        if ($state) {
            $params['state'] = $state;
        }

        return $this->search($params);
    }

    private function search(array $params): array
    {
        try {
            $response = Http::timeout(10)->get(self::API_URL, $params);

            if (!$response->successful()) {
                return [];
            }

            $data = $response->json();

            if (($data['result_count'] ?? 0) === 0) {
                return [];
            }

            return array_map([$this, 'normalizeResult'], $data['results']);
        } catch (\Throwable $e) {
            Log::warning('NPI search failed', ['error' => $e->getMessage(), 'params' => $params]);
            return [];
        }
    }

    /**
     * Normalize an NPPES result into a clean structure.
     */
    private function normalizeResult(array $result): array
    {
        $basic = $result['basic'] ?? [];
        $taxonomies = $result['taxonomies'] ?? [];
        $addresses = $result['addresses'] ?? [];

        $primaryTaxonomy = collect($taxonomies)->firstWhere('primary', true) ?? ($taxonomies[0] ?? []);
        $practiceAddress = collect($addresses)->firstWhere('address_purpose', 'LOCATION') ?? ($addresses[0] ?? []);

        $isIndividual = ($result['enumeration_type'] ?? '') === 'NPI-1';

        return [
            'npi' => (string) ($result['number'] ?? ''),
            'enumeration_type' => $result['enumeration_type'] ?? '',
            'first_name' => $basic['first_name'] ?? '',
            'last_name' => $basic['last_name'] ?? '',
            'organization_name' => $basic['organization_name'] ?? null,
            'name' => $isIndividual
                ? trim(($basic['first_name'] ?? '') . ' ' . ($basic['last_name'] ?? ''))
                : ($basic['organization_name'] ?? ''),
            'credential' => $basic['credential'] ?? null,
            'taxonomy' => $primaryTaxonomy['desc'] ?? '',
            'taxonomy_code' => $primaryTaxonomy['code'] ?? '',
            'address' => [
                'line1' => $practiceAddress['address_1'] ?? '',
                'line2' => $practiceAddress['address_2'] ?? '',
                'city' => $practiceAddress['city'] ?? '',
                'state' => $practiceAddress['state'] ?? '',
                'zip' => substr($practiceAddress['postal_code'] ?? '', 0, 5),
            ],
            'phone' => $practiceAddress['telephone_number'] ?? null,
        ];
    }
}
