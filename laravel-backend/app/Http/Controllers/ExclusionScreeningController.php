<?php

namespace App\Http\Controllers;

use App\Models\ExclusionScreening;
use App\Models\User;
use App\Services\OigScreeningService;
use App\Services\SamGovScreeningService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ExclusionScreeningController extends Controller
{
    public function __construct(
        private OigScreeningService $oigService,
        private SamGovScreeningService $samService,
    ) {}

    /**
     * Screen a single user against all exclusion sources (OIG + SAM.gov).
     * POST /exclusion-screenings/{user}/screen
     */
    public function screen(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        if (!$authUser->isAdmin() && !$authUser->isSiteManager() && !$authUser->isCoordinator()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $source = $request->input('source'); // optional: 'oig_leie', 'sam_gov', or null for both

        $screenings = [];

        if (!$source || $source === 'oig_leie') {
            $screenings[] = $this->oigService->screenUser($user, $authUser);
        }
        if (!$source || $source === 'sam_gov') {
            $screenings[] = $this->samService->screenUser($user, $authUser);
        }

        $hasMatch = collect($screenings)->contains(fn($s) => $s->isMatch());
        $formatted = array_map(fn($s) => $this->formatScreening($s), $screenings);

        return response()->json([
            'screenings' => $formatted,
            'message' => $hasMatch
                ? 'Potential exclusion match found — review details.'
                : 'No exclusion records found across all sources.',
        ]);
    }

    /**
     * Bulk screen all active preceptors/practitioners against all sources.
     * POST /exclusion-screenings/bulk
     */
    public function bulkScreen(Request $request): JsonResponse
    {
        $authUser = $request->user();

        if (!$authUser->isAdmin()) {
            return response()->json(['message' => 'Only admins can run bulk screenings.'], 403);
        }

        $users = User::where('is_active', true)
            ->whereIn('role', ['preceptor', 'practitioner'])
            ->get();

        $source = $request->input('source'); // optional: 'oig_leie', 'sam_gov', or null for both

        $results = [];

        if (!$source || $source === 'oig_leie') {
            $results = array_merge($results, $this->oigService->screenUsers($users, $authUser));
        }
        if (!$source || $source === 'sam_gov') {
            $results = array_merge($results, $this->samService->screenUsers($users, $authUser));
        }

        $summary = [
            'total_screened' => count($results),
            'clear' => collect($results)->where('result', 'clear')->count(),
            'matches' => collect($results)->where('result', 'match_found')->count(),
            'errors' => collect($results)->where('result', 'error')->count(),
        ];

        return response()->json([
            'summary' => $summary,
            'message' => $summary['matches'] > 0
                ? "{$summary['matches']} potential match(es) found. Review screening results."
                : "All {$summary['clear']} providers cleared.",
        ]);
    }

    /**
     * Get screening history for a user.
     * GET /exclusion-screenings/{user}
     */
    public function history(Request $request, User $user): JsonResponse
    {
        $authUser = $request->user();

        // Users can see their own, admins/managers/coordinators can see anyone
        if ($authUser->id !== $user->id
            && !$authUser->isAdmin()
            && !$authUser->isSiteManager()
            && !$authUser->isCoordinator()
        ) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $screenings = ExclusionScreening::where('user_id', $user->id)
            ->with('screenedBy:id,first_name,last_name')
            ->orderByDesc('created_at')
            ->paginate(20);

        $screenings->getCollection()->transform(fn($s) => $this->formatScreening($s));

        return response()->json($screenings);
    }

    /**
     * Get all screening results (admin dashboard view).
     * GET /exclusion-screenings
     */
    public function index(Request $request): JsonResponse
    {
        $authUser = $request->user();

        if (!$authUser->isAdmin() && !$authUser->isSiteManager() && !$authUser->isCoordinator()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = ExclusionScreening::with(['user:id,first_name,last_name,email,role', 'screenedBy:id,first_name,last_name']);

        // Filter by result
        if ($request->filled('result')) {
            $query->where('result', $request->result);
        }

        // Filter by source
        if ($request->filled('source')) {
            $query->where('source', $request->source);
        }

        // Filter by user
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Only latest per user
        if ($request->boolean('latest_only')) {
            $query->whereIn('id', function ($sub) {
                $sub->selectRaw('MAX(id)')
                    ->from('exclusion_screenings')
                    ->groupBy('user_id', 'source');
            });
        }

        $screenings = $query->orderByDesc('created_at')->paginate(25);

        $screenings->getCollection()->transform(fn($s) => $this->formatScreening($s));

        return response()->json($screenings);
    }

    /**
     * Get screening summary/stats.
     * GET /exclusion-screenings/summary
     */
    public function summary(Request $request): JsonResponse
    {
        $authUser = $request->user();

        if (!$authUser->isAdmin() && !$authUser->isSiteManager() && !$authUser->isCoordinator()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $totalScreenings = ExclusionScreening::count();
        $latestScreenings = ExclusionScreening::whereIn('id', function ($sub) {
            $sub->selectRaw('MAX(id)')
                ->from('exclusion_screenings')
                ->groupBy('user_id', 'source');
        });

        $uniqueUsersScreened = (clone $latestScreenings)->distinct('user_id')->count('user_id');
        $activeMatches = (clone $latestScreenings)->where('result', 'match_found')->count();
        $clearUsers = (clone $latestScreenings)->where('result', 'clear')->count();

        // Preceptors/practitioners not yet screened (across any source)
        $screenedUserIds = ExclusionScreening::distinct('user_id')->pluck('user_id');
        $unscreened = User::where('is_active', true)
            ->whereIn('role', ['preceptor', 'practitioner'])
            ->whereNotIn('id', $screenedUserIds)
            ->count();

        $samConfigured = !empty(config('services.sam_gov.api_key'));

        return response()->json([
            'total_screenings' => $totalScreenings,
            'unique_users_screened' => $uniqueUsersScreened,
            'active_matches' => $activeMatches,
            'clear_users' => $clearUsers,
            'unscreened_providers' => $unscreened,
            'databases' => [
                [
                    'source' => 'oig_leie',
                    'label' => 'OIG LEIE',
                    'record_count' => $this->oigService->getRecordCount(),
                    'last_import' => $this->oigService->getLastImportDate(),
                    'configured' => true,
                ],
                [
                    'source' => 'sam_gov',
                    'label' => 'SAM.gov',
                    'record_count' => null,
                    'last_import' => null,
                    'configured' => $samConfigured,
                ],
            ],
            // Keep legacy field for backward compatibility
            'database' => [
                'source' => 'OIG LEIE',
                'record_count' => $this->oigService->getRecordCount(),
                'last_import' => $this->oigService->getLastImportDate(),
            ],
        ]);
    }

    /**
     * Trigger a database import (admin only).
     * POST /exclusion-screenings/import
     */
    public function import(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Only admins can import the exclusion database.'], 403);
        }

        try {
            $count = $this->oigService->importLeieDatabase();
            return response()->json([
                'message' => "Successfully imported {$count} exclusion records.",
                'record_count' => $count,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function formatScreening(ExclusionScreening $screening): array
    {
        return [
            'id' => $screening->id,
            'user_id' => $screening->user_id,
            'user' => $screening->relationLoaded('user') ? $screening->user : null,
            'screened_by' => $screening->relationLoaded('screenedBy') ? $screening->screenedBy : null,
            'source' => $screening->source,
            'source_label' => match ($screening->source) {
                'oig_leie' => 'OIG LEIE',
                'sam_gov' => 'SAM.gov',
                default => $screening->source,
            },
            'match_type' => $screening->match_type,
            'result' => $screening->result,
            'result_label' => match ($screening->result) {
                'clear' => 'Clear',
                'match_found' => 'Match Found',
                'error' => 'Error',
                default => $screening->result,
            },
            'match_details' => $screening->match_details,
            'notes' => $screening->notes,
            'created_at' => $screening->created_at?->toISOString(),
        ];
    }
}
