<?php

namespace App\Services;

use App\Models\Application;
use App\Models\MatchingPreference;
use App\Models\PreceptorReview;
use App\Models\RotationSlot;
use App\Models\User;
use Illuminate\Support\Collection;

class MatchingService
{
    /**
     * Match open slots to a student based on their preferences.
     *
     * @return array [{ slot: RotationSlot, score: float, breakdown: array }]
     */
    public function matchForStudent(User $student, int $limit = 20): array
    {
        $prefs = $student->matchingPreferences;

        if (!$prefs) {
            return [];
        }

        $query = RotationSlot::with(['site', 'preceptor'])
            ->where('status', 'open')
            ->where('start_date', '>=', now());

        // Exclude slots already applied to
        if ($prefs->exclude_applied) {
            $appliedSlotIds = Application::where('student_id', $student->id)
                ->pluck('slot_id')
                ->toArray();
            if ($appliedSlotIds) {
                $query->whereNotIn('id', $appliedSlotIds);
            }
        }

        $slots = $query->get();

        // Pre-fetch preceptor ratings in bulk to avoid N+1
        $preceptorIds = $slots->pluck('preceptor_id')->filter()->unique()->values();
        $preceptorRatings = [];
        if ($preceptorIds->isNotEmpty()) {
            $preceptorRatings = PreceptorReview::whereIn('preceptor_id', $preceptorIds)
                ->groupBy('preceptor_id')
                ->selectRaw('preceptor_id, AVG(overall_score) as avg_score')
                ->pluck('avg_score', 'preceptor_id')
                ->toArray();
        }

        // Load student clinical interests for secondary specialty matching
        $clinicalInterests = $student->studentProfile?->clinical_interests ?? [];

        $results = [];

        foreach ($slots as $slot) {
            $breakdown = $this->scoreSlot($slot, $prefs, $preceptorRatings, $clinicalInterests);
            $total = array_sum($breakdown);
            $results[] = [
                'slot' => $slot,
                'score' => round($total, 1),
                'breakdown' => $breakdown,
            ];
        }

        // Sort by score descending
        usort($results, fn($a, $b) => $b['score'] <=> $a['score']);

        return array_slice($results, 0, $limit);
    }

    private function scoreSlot(RotationSlot $slot, MatchingPreference $prefs, array $preceptorRatings, array $clinicalInterests): array
    {
        return [
            'specialty' => $this->scoreSpecialty($slot, $prefs, $clinicalInterests),
            'location' => $this->scoreLocation($slot, $prefs),
            'cost' => $this->scoreCost($slot, $prefs),
            'schedule' => $this->scoreSchedule($slot, $prefs),
            'preceptor_rating' => $this->scorePreceptorRating($slot, $prefs, $preceptorRatings),
            'date_range' => $this->scoreDateRange($slot, $prefs),
            'availability' => $this->scoreAvailability($slot),
        ];
    }

    private function scoreSpecialty(RotationSlot $slot, MatchingPreference $prefs, array $clinicalInterests): float
    {
        $preferred = $prefs->preferred_specialties ?? [];
        $slotSpecialty = strtolower($slot->specialty ?? '');

        // No preferences set: use clinical interests as fallback
        if (empty($preferred) && empty($clinicalInterests)) return 15; // neutral

        // Check explicit preferences first (highest weight)
        if (!empty($preferred)) {
            foreach ($preferred as $pref) {
                if (strtolower($pref) === $slotSpecialty) return 30;
            }
            foreach ($preferred as $pref) {
                if (str_contains($slotSpecialty, strtolower($pref)) || str_contains(strtolower($pref), $slotSpecialty)) {
                    return 20;
                }
            }
        }

        // Check clinical interests as secondary signal
        if (!empty($clinicalInterests)) {
            foreach ($clinicalInterests as $interest) {
                if (strtolower($interest) === $slotSpecialty) return 25;
            }
            foreach ($clinicalInterests as $interest) {
                if (str_contains($slotSpecialty, strtolower($interest)) || str_contains(strtolower($interest), $slotSpecialty)) {
                    return 15;
                }
            }
        }

        // No match from either source
        return empty($preferred) ? 15 : 0; // neutral if no explicit prefs, 0 if prefs set but no match
    }

    private function scoreLocation(RotationSlot $slot, MatchingPreference $prefs): float
    {
        $preferredStates = $prefs->preferred_states ?? [];
        $preferredCities = $prefs->preferred_cities ?? [];
        if (empty($preferredStates) && empty($preferredCities)) return 10; // neutral

        $site = $slot->site;
        if (!$site) return 0;

        $stateMatch = false;
        $cityMatch = false;

        if (!empty($preferredStates)) {
            $siteState = strtolower($site->state ?? '');
            foreach ($preferredStates as $state) {
                if (strtolower($state) === $siteState) {
                    $stateMatch = true;
                    break;
                }
            }
        }

        if (!empty($preferredCities)) {
            $siteCity = strtolower($site->city ?? '');
            foreach ($preferredCities as $city) {
                if (strtolower($city) === $siteCity) {
                    $cityMatch = true;
                    break;
                }
            }
        }

        // City + state match = full score, city only = 15, state only = 12, neither = 0
        if ($cityMatch && $stateMatch) return 20;
        if ($cityMatch) return 15;
        if ($stateMatch) return 12;
        return 0;
    }

    private function scoreCost(RotationSlot $slot, MatchingPreference $prefs): float
    {
        $pref = $prefs->cost_preference ?? 'any';
        if ($pref === 'any' || $pref === 'paid_ok') return 15;

        // free_only
        $isPaid = $slot->cost_type === 'paid' && $slot->cost > 0;
        return $isPaid ? 0 : 15;
    }

    private function scoreSchedule(RotationSlot $slot, MatchingPreference $prefs): float
    {
        $preferredSchedule = strtolower($prefs->preferred_schedule ?? '');
        if (empty($preferredSchedule)) return 5; // neutral

        $slotSchedule = strtolower($slot->shift_schedule ?? '');
        if (empty($slotSchedule)) return 5;

        if (str_contains($slotSchedule, $preferredSchedule) || str_contains($preferredSchedule, $slotSchedule)) {
            return 10;
        }
        return 0;
    }

    private function scorePreceptorRating(RotationSlot $slot, MatchingPreference $prefs, array $preceptorRatings): float
    {
        $minRating = $prefs->min_preceptor_rating;
        if (!$minRating || !$slot->preceptor_id) return 5; // neutral

        $avgRating = $preceptorRatings[$slot->preceptor_id] ?? null;

        if (!$avgRating) return 5; // no reviews, neutral

        if ($avgRating >= $minRating) return 10;

        // Proportional score
        return round(($avgRating / $minRating) * 10, 1);
    }

    private function scoreDateRange(RotationSlot $slot, MatchingPreference $prefs): float
    {
        $after = $prefs->preferred_start_after;
        $before = $prefs->preferred_start_before;
        if (!$after && !$before) return 5; // neutral

        $startDate = $slot->start_date;
        if (!$startDate) return 5;

        $inRange = true;
        if ($after && $startDate->lt($after)) $inRange = false;
        if ($before && $startDate->gt($before)) $inRange = false;

        if ($inRange) return 10;

        // Within 30 days of range
        if ($after && $startDate->lt($after) && $startDate->diffInDays($after) <= 30) return 5;
        if ($before && $startDate->gt($before) && $startDate->diffInDays($before) <= 30) return 5;

        return 0;
    }

    private function scoreAvailability(RotationSlot $slot): float
    {
        return $slot->hasAvailability() ? 5 : 0;
    }
}
