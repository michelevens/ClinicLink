<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Seeds the state_rules table with NP practice authority data for all 50 US states + DC.
 *
 * Classifications:
 * - full: NP independent practice, no supervision required
 * - reduced: Collaborative relationship required in some form
 * - restricted: Formal supervision required
 *
 * Ratios and chart review percentages are NULL unless confidently known.
 * This is compliance support data, not legal advice.
 *
 * Idempotent: uses upsert keyed on `state` — safe to run repeatedly.
 */
class StateRulesSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $lastUpdated = '2025-01-01';

        $rows = [
            // Full Practice Authority (~27 states + DC)
            ['state' => 'AK', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'AZ', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'CO', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'CT', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'DC', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'DE', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'HI', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'ID', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'IA', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'KS', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'ME', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'MD', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'MN', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'MT', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'NE', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'NV', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'NH', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'NM', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'ND', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'OR', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'RI', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'SD', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'UT', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'VT', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'WA', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'WY', 'practice_level' => 'full', 'supervision_required' => false, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],

            // Reduced Practice (~12 states) — collaborative agreement required
            ['state' => 'AL', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'AR', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'IL', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'IN', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'KY', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'LA', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'MS', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'NJ', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'NY', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'OH', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'PA', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'WI', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'WV', 'practice_level' => 'reduced', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],

            // Restricted Practice (~13 states) — formal supervision required
            ['state' => 'CA', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => 4, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'FL', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'GA', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => 4, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'MA', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'MI', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'MO', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'NC', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'OK', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'SC', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'TN', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'TX', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => 7, 'chart_review_percent' => 10, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
            ['state' => 'VA', 'practice_level' => 'restricted', 'supervision_required' => true, 'max_np_ratio' => null, 'chart_review_percent' => null, 'telehealth_allowed' => true, 'last_updated' => $lastUpdated],
        ];

        // Add UUID id and timestamps to each row
        $rows = array_map(function ($row) use ($now) {
            return array_merge($row, [
                'id' => Str::uuid()->toString(),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }, $rows);

        DB::table('state_rules')->upsert(
            $rows,
            ['state'],
            ['practice_level', 'supervision_required', 'max_np_ratio', 'chart_review_percent', 'telehealth_allowed', 'last_updated', 'updated_at']
        );
    }
}
