<?php

namespace App\Services;

use App\Models\Application;
use App\Models\HourLog;
use App\Models\Payment;
use App\Models\RotationSlot;
use App\Models\RotationSite;
use App\Models\University;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function platformMetrics(string $from, string $to): array
    {
        $placements = Application::where('status', 'completed')
            ->whereBetween('reviewed_at', [$from, $to])
            ->count();

        $totalApps = Application::whereBetween('created_at', [$from, $to])->count();

        $avgTimeToPlace = Application::where('status', 'accepted')
            ->whereBetween('reviewed_at', [$from, $to])
            ->whereNotNull('submitted_at')
            ->selectRaw('AVG(EXTRACT(EPOCH FROM (reviewed_at - submitted_at)) / 86400) as avg_days')
            ->value('avg_days');

        $activeStudents = User::where('role', 'student')
            ->where('is_active', true)
            ->count();

        $totalHours = HourLog::where('status', 'approved')
            ->whereBetween('date', [$from, $to])
            ->sum('hours');

        $slotCapacity = RotationSlot::where('status', 'open')->sum('capacity');
        $slotFilled = RotationSlot::where('status', 'open')->sum('filled');
        $slotFillRate = $slotCapacity > 0 ? ($slotFilled / $slotCapacity) * 100 : 0;

        $revenue = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [$from, $to])
            ->sum('amount');

        $platformFees = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [$from, $to])
            ->sum('platform_fee');

        return [
            'total_placements' => $placements,
            'placement_rate' => $totalApps > 0 ? round(($placements / $totalApps) * 100, 1) : 0,
            'avg_time_to_place' => round($avgTimeToPlace ?? 0, 1),
            'active_students' => $activeStudents,
            'total_hours' => round($totalHours, 1),
            'slot_fill_rate' => round($slotFillRate, 1),
            'revenue' => round($revenue, 2),
            'platform_fees' => round($platformFees, 2),
        ];
    }

    public function platformTimeSeries(string $period, string $from, string $to): array
    {
        $format = $period === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD';
        $phpFormat = $period === 'monthly' ? 'Y-m' : 'Y-m-d';

        $rows = Application::where('status', 'completed')
            ->whereBetween('reviewed_at', [$from, $to])
            ->selectRaw("TO_CHAR(reviewed_at, '{$format}') as date, COUNT(*) as placements")
            ->groupByRaw("TO_CHAR(reviewed_at, '{$format}')")
            ->orderBy('date')
            ->get();

        return $rows->map(fn($r) => [
            'date' => $r->date,
            'placements' => (int) $r->placements,
        ])->toArray();
    }

    public function universityMetrics(string $universityId, string $from, string $to): array
    {
        $studentIds = User::where('role', 'student')
            ->whereHas('studentProfile', function ($q) use ($universityId) {
                $q->where('university_id', $universityId);
            })
            ->pluck('id');

        $totalStudents = $studentIds->count();
        $placed = Application::whereIn('student_id', $studentIds)
            ->whereIn('status', ['accepted', 'completed'])
            ->distinct('student_id')
            ->count('student_id');

        $totalHours = HourLog::whereIn('student_id', $studentIds)
            ->where('status', 'approved')
            ->whereBetween('date', [$from, $to])
            ->sum('hours');

        $avgHours = $totalStudents > 0 ? $totalHours / $totalStudents : 0;

        return [
            'total_students' => $totalStudents,
            'students_placed' => $placed,
            'placement_rate' => $totalStudents > 0 ? round(($placed / $totalStudents) * 100, 1) : 0,
            'total_hours' => round($totalHours, 1),
            'avg_hours_per_student' => round($avgHours, 1),
        ];
    }

    public function universityTimeSeries(string $universityId, string $period, string $from, string $to): array
    {
        $format = $period === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD';

        $studentIds = User::where('role', 'student')
            ->whereHas('studentProfile', function ($q) use ($universityId) {
                $q->where('university_id', $universityId);
            })
            ->pluck('id');

        $rows = Application::whereIn('student_id', $studentIds)
            ->where('status', 'completed')
            ->whereBetween('reviewed_at', [$from, $to])
            ->selectRaw("TO_CHAR(reviewed_at, '{$format}') as date, COUNT(*) as placements")
            ->groupByRaw("TO_CHAR(reviewed_at, '{$format}')")
            ->orderBy('date')
            ->get();

        return $rows->map(fn($r) => [
            'date' => $r->date,
            'placements' => (int) $r->placements,
        ])->toArray();
    }

    public function siteMetrics(string $siteId, string $from, string $to): array
    {
        $slotIds = RotationSlot::where('site_id', $siteId)->pluck('id');

        $capacity = RotationSlot::where('site_id', $siteId)->where('status', 'open')->sum('capacity');
        $filled = RotationSlot::where('site_id', $siteId)->where('status', 'open')->sum('filled');
        $fillRate = $capacity > 0 ? ($filled / $capacity) * 100 : 0;

        $totalApps = Application::whereIn('slot_id', $slotIds)
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $slotCount = RotationSlot::where('site_id', $siteId)->count();
        $avgAppsPerSlot = $slotCount > 0 ? $totalApps / $slotCount : 0;

        $revenue = Payment::where('status', 'completed')
            ->whereIn('slot_id', $slotIds)
            ->whereBetween('paid_at', [$from, $to])
            ->sum('amount');

        return [
            'slot_fill_rate' => round($fillRate, 1),
            'total_applications' => $totalApps,
            'avg_apps_per_slot' => round($avgAppsPerSlot, 1),
            'revenue' => round($revenue, 2),
            'total_slots' => $slotCount,
            'capacity' => $capacity,
            'filled' => $filled,
        ];
    }

    public function siteTimeSeries(string $siteId, string $period, string $from, string $to): array
    {
        $format = $period === 'monthly' ? 'YYYY-MM' : 'YYYY-MM-DD';
        $slotIds = RotationSlot::where('site_id', $siteId)->pluck('id');

        $rows = Application::whereIn('slot_id', $slotIds)
            ->whereIn('status', ['accepted', 'completed'])
            ->whereBetween('reviewed_at', [$from, $to])
            ->selectRaw("TO_CHAR(reviewed_at, '{$format}') as date, COUNT(*) as placements")
            ->groupByRaw("TO_CHAR(reviewed_at, '{$format}')")
            ->orderBy('date')
            ->get();

        return $rows->map(fn($r) => [
            'date' => $r->date,
            'placements' => (int) $r->placements,
        ])->toArray();
    }

    public function specialtyDemand(): array
    {
        $rows = Application::join('rotation_slots', 'applications.slot_id', '=', 'rotation_slots.id')
            ->selectRaw('rotation_slots.specialty, COUNT(*) as demand')
            ->groupBy('rotation_slots.specialty')
            ->orderByDesc('demand')
            ->limit(15)
            ->get();

        return $rows->map(fn($r) => [
            'specialty' => $r->specialty,
            'demand' => (int) $r->demand,
        ])->toArray();
    }

    public function demandHeatMap(): array
    {
        $rows = Application::join('rotation_slots', 'applications.slot_id', '=', 'rotation_slots.id')
            ->join('rotation_sites', 'rotation_slots.site_id', '=', 'rotation_sites.id')
            ->selectRaw('rotation_sites.state, COUNT(*) as applications')
            ->groupBy('rotation_sites.state')
            ->orderByDesc('applications')
            ->get();

        return $rows->map(fn($r) => [
            'state' => $r->state,
            'applications' => (int) $r->applications,
        ])->toArray();
    }

    public function summary(?User $user = null): array
    {
        $now = now();
        $from = $now->copy()->subDays(30)->toDateString();
        $to = $now->toDateString();

        if ($user && $user->role === 'site_manager') {
            $site = $user->managedSites()->first();
            if ($site) {
                return $this->siteMetrics($site->id, $from, $to);
            }
        }

        if ($user && $user->role === 'coordinator') {
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                return $this->universityMetrics($universityId, $from, $to);
            }
        }

        return $this->platformMetrics($from, $to);
    }
}
