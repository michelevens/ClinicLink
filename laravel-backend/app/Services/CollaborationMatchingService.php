<?php

namespace App\Services;

use App\Models\CollaborationRequest;
use App\Models\PhysicianProfile;

class CollaborationMatchingService
{
    /**
     * Find matching physician profiles for a collaboration request.
     *
     * Scoring:
     * - State overlap: 40 pts (required gate — at least 1 state must overlap)
     * - Specialty match: 30 pts
     * - Practice model compatibility: 20 pts
     * - Capacity bonus: 10 pts (more capacity = higher score)
     *
     * @return array<int, array{profile: PhysicianProfile, score: float, reasons: array}>
     */
    public function findMatches(CollaborationRequest $request, int $limit = 10): array
    {
        $profiles = PhysicianProfile::where('is_active', true)
            ->with('user')
            ->withCount(['matches as accepted_count' => fn ($q) => $q->where('status', 'accepted')])
            ->get();

        $matches = [];

        foreach ($profiles as $profile) {
            $score = 0;
            $reasons = [];
            $acceptedCount = (int) ($profile->accepted_count ?? 0);

            // State overlap (required gate — 40 pts)
            $stateOverlap = array_intersect(
                $request->states_requested,
                $profile->licensed_states
            );

            if (empty($stateOverlap)) {
                continue;
            }

            $stateScore = min(40, count($stateOverlap) * 20);
            $score += $stateScore;
            $reasons[] = count($stateOverlap) . ' state(s) overlap: ' . implode(', ', $stateOverlap);

            // Specialty match (30 pts)
            if (in_array($request->specialty, $profile->specialties)) {
                $score += 30;
                $reasons[] = 'Specialty match: ' . $request->specialty;
            }

            // Practice model compatibility (20 pts)
            if ($profile->supervision_model === $request->practice_model) {
                $score += 20;
                $reasons[] = 'Practice model match: ' . $request->practice_model;
            } elseif ($profile->supervision_model === 'hybrid') {
                $score += 15;
                $reasons[] = 'Physician offers hybrid (compatible)';
            }

            // Capacity bonus (10 pts) — use eager-loaded count to avoid N+1
            if ($acceptedCount >= $profile->max_supervisees) {
                continue; // Skip profiles at capacity
            }

            $remaining = $profile->max_supervisees - $acceptedCount;
            $score += min(10, $remaining * 2);
            $reasons[] = $remaining . ' supervisee slot(s) available';

            $matches[] = [
                'profile' => $profile,
                'score' => round($score, 2),
                'reasons' => $reasons,
            ];
        }

        // Sort by score descending
        usort($matches, fn ($a, $b) => $b['score'] <=> $a['score']);

        return array_slice($matches, 0, $limit);
    }
}
