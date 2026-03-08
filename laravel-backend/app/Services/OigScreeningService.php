<?php

namespace App\Services;

use App\Models\ExclusionScreening;
use App\Models\OigExclusion;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OigScreeningService
{
    private const LEIE_CSV_URL = 'https://oig.hhs.gov/exclusions/downloadables/UPDATED.csv';
    private const CSV_DISK = 'local';
    private const CSV_PATH = 'oig/UPDATED.csv';

    /**
     * Download and import the LEIE CSV into the oig_exclusions table.
     * Returns the number of records imported.
     */
    public function importLeieDatabase(): int
    {
        // Download CSV
        $response = Http::timeout(120)->get(self::LEIE_CSV_URL);

        if (!$response->successful()) {
            throw new \RuntimeException("Failed to download LEIE CSV: HTTP {$response->status()}");
        }

        Storage::disk(self::CSV_DISK)->put(self::CSV_PATH, $response->body());
        $csvPath = Storage::disk(self::CSV_DISK)->path(self::CSV_PATH);

        // Parse and import
        $handle = fopen($csvPath, 'r');
        if (!$handle) {
            throw new \RuntimeException("Failed to open downloaded CSV file");
        }

        // Read header row
        $headers = fgetcsv($handle);
        if (!$headers) {
            fclose($handle);
            throw new \RuntimeException("CSV file is empty or has no headers");
        }

        // Normalize headers to lowercase
        $headers = array_map(fn($h) => strtolower(trim($h)), $headers);

        // Map CSV columns to our DB columns
        $columnMap = [
            'lastname' => 'lastname',
            'firstname' => 'firstname',
            'midname' => 'midname',
            'busname' => 'busname',
            'general' => 'general',
            'specialty' => 'specialty',
            'upin' => 'upin',
            'npi' => 'npi',
            'dob' => 'dob',
            'address' => 'address',
            'city' => 'city',
            'state' => 'state',
            'zip' => 'zip',
            'zip code' => 'zip',
            'excltype' => 'excltype',
            'excldate' => 'excldate',
            'reindate' => 'reindate',
            'waiverdate' => 'waiverdate',
            'waiverstate' => 'waiverstate',
        ];

        // Truncate and re-import (LEIE file is a complete snapshot)
        DB::transaction(function () use ($handle, $headers, $columnMap, &$count) {
            OigExclusion::truncate();

            $batch = [];
            $count = 0;
            $now = now();

            while (($row = fgetcsv($handle)) !== false) {
                if (count($row) < count($headers)) continue;

                $record = ['created_at' => $now, 'updated_at' => $now];
                foreach ($headers as $i => $header) {
                    if (isset($columnMap[$header])) {
                        $record[$columnMap[$header]] = trim($row[$i]) ?: null;
                    }
                }

                $batch[] = $record;
                $count++;

                // Insert in batches of 1000
                if (count($batch) >= 1000) {
                    OigExclusion::insert($batch);
                    $batch = [];
                }
            }

            if (!empty($batch)) {
                OigExclusion::insert($batch);
            }
        });

        fclose($handle);

        Log::info("OIG LEIE import complete: {$count} records imported");

        return $count;
    }

    /**
     * Screen a single user against the OIG exclusion list.
     * Returns the ExclusionScreening record.
     */
    public function screenUser(User $user, ?User $screenedBy = null): ExclusionScreening
    {
        $matches = $this->findMatches($user);

        if ($matches->isEmpty()) {
            return ExclusionScreening::create([
                'user_id' => $user->id,
                'screened_by' => $screenedBy?->id,
                'source' => 'oig_leie',
                'match_type' => null,
                'result' => 'clear',
                'match_details' => null,
            ]);
        }

        // Take the strongest match
        $bestMatch = $matches->first();

        return ExclusionScreening::create([
            'user_id' => $user->id,
            'screened_by' => $screenedBy?->id,
            'source' => 'oig_leie',
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
                Log::warning("OIG screening failed for user {$user->id}: {$e->getMessage()}");
                $results[] = ExclusionScreening::create([
                    'user_id' => $user->id,
                    'screened_by' => $screenedBy?->id,
                    'source' => 'oig_leie',
                    'result' => 'error',
                    'notes' => $e->getMessage(),
                ]);
            }
        }
        return $results;
    }

    /**
     * Find matches for a user in the exclusion database.
     * Tries NPI first (strongest), then name+DOB, then name+state.
     */
    private function findMatches(User $user): Collection
    {
        $matches = collect();

        // 1. NPI match (strongest — exact identifier match)
        $npi = $user->preceptorProfile?->npi_number;
        if ($npi) {
            $npiMatches = OigExclusion::where('npi', $npi)->get();
            foreach ($npiMatches as $match) {
                $matches->push([
                    'match_type' => 'npi',
                    'confidence' => 'high',
                    'record' => $this->formatRecord($match),
                ]);
            }
        }

        // 2. Name + DOB match (strong — two identifiers)
        $lastName = strtoupper(trim($user->last_name ?? ''));
        $firstName = strtoupper(trim($user->first_name ?? ''));

        if ($lastName) {
            $query = OigExclusion::whereRaw('UPPER(lastname) = ?', [$lastName]);

            if ($firstName) {
                $query->where(function ($q) use ($firstName) {
                    $q->whereRaw('UPPER(firstname) = ?', [$firstName])
                      ->orWhereRaw('UPPER(firstname) LIKE ?', [substr($firstName, 0, 1) . '%']);
                });
            }

            $nameMatches = $query->get();

            foreach ($nameMatches as $match) {
                // If we already matched by NPI, skip name-only duplicates
                if ($matches->contains(fn($m) => $m['record']['npi'] === $match->npi && $match->npi)) {
                    continue;
                }

                $matchType = 'name_state';
                $confidence = 'low';

                // Boost confidence if first name is exact match
                if ($firstName && strtoupper(trim($match->firstname ?? '')) === $firstName) {
                    $matchType = 'name_exact';
                    $confidence = 'medium';
                }

                $matches->push([
                    'match_type' => $matchType,
                    'confidence' => $confidence,
                    'record' => $this->formatRecord($match),
                ]);
            }
        }

        // Sort by confidence: high > medium > low
        $order = ['high' => 0, 'medium' => 1, 'low' => 2];
        return $matches->sortBy(fn($m) => $order[$m['confidence']] ?? 3)->values();
    }

    /**
     * Format an OIG exclusion record for storage.
     */
    private function formatRecord(OigExclusion $exclusion): array
    {
        return [
            'lastname' => $exclusion->lastname,
            'firstname' => $exclusion->firstname,
            'midname' => $exclusion->midname,
            'busname' => $exclusion->busname,
            'general' => $exclusion->general,
            'specialty' => $exclusion->specialty,
            'npi' => $exclusion->npi,
            'dob' => $exclusion->formatted_dob,
            'state' => $exclusion->state,
            'excltype' => $exclusion->excltype,
            'exclusion_type_description' => $exclusion->exclusion_type_description,
            'exclusion_date' => $exclusion->exclusion_date,
        ];
    }

    /**
     * Get the last import date.
     */
    public function getLastImportDate(): ?string
    {
        $latest = OigExclusion::orderBy('updated_at', 'desc')->first();
        return $latest?->updated_at?->toDateTimeString();
    }

    /**
     * Get total records in the exclusion database.
     */
    public function getRecordCount(): int
    {
        return OigExclusion::count();
    }
}
