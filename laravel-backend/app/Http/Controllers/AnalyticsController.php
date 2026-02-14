<?php

namespace App\Http\Controllers;

use App\Models\University;
use App\Models\RotationSite;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analyticsService
    ) {}

    /**
     * Role-scoped quick summary (dashboard cards).
     */
    public function summary(Request $request): JsonResponse
    {
        $data = $this->analyticsService->summary($request->user());

        return response()->json($data);
    }

    /**
     * Platform-wide analytics (admin only).
     */
    public function platform(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date'],
            'period' => ['sometimes', 'in:daily,monthly'],
        ]);

        $period = $validated['period'] ?? 'daily';

        return response()->json([
            'summary' => $this->analyticsService->platformMetrics($validated['from'], $validated['to']),
            'time_series' => $this->analyticsService->platformTimeSeries($period, $validated['from'], $validated['to']),
        ]);
    }

    /**
     * University-specific analytics.
     */
    public function university(Request $request, University $university): JsonResponse
    {
        $user = $request->user();

        // Coordinators can only see their own university
        if ($user->role === 'coordinator') {
            $userUniId = $user->studentProfile?->university_id;
            if ($userUniId !== $university->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date'],
            'period' => ['sometimes', 'in:daily,monthly'],
        ]);

        $period = $validated['period'] ?? 'daily';

        return response()->json([
            'summary' => $this->analyticsService->universityMetrics($university->id, $validated['from'], $validated['to']),
            'time_series' => $this->analyticsService->universityTimeSeries($university->id, $period, $validated['from'], $validated['to']),
        ]);
    }

    /**
     * Site-specific analytics.
     */
    public function site(Request $request, RotationSite $site): JsonResponse
    {
        $user = $request->user();

        // Site managers can only see their own sites
        if ($user->role === 'site_manager' && $site->manager_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'from' => ['required', 'date'],
            'to' => ['required', 'date'],
            'period' => ['sometimes', 'in:daily,monthly'],
        ]);

        $period = $validated['period'] ?? 'daily';

        return response()->json([
            'summary' => $this->analyticsService->siteMetrics($site->id, $validated['from'], $validated['to']),
            'time_series' => $this->analyticsService->siteTimeSeries($site->id, $period, $validated['from'], $validated['to']),
        ]);
    }

    /**
     * Demand heat map by state.
     */
    public function demandHeatMap(): JsonResponse
    {
        return response()->json([
            'states' => $this->analyticsService->demandHeatMap(),
        ]);
    }

    /**
     * Specialty demand breakdown.
     */
    public function specialtyDemand(): JsonResponse
    {
        return response()->json([
            'specialties' => $this->analyticsService->specialtyDemand(),
        ]);
    }
}
