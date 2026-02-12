<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\HourLog;
use App\Models\RotationSite;
use App\Models\RotationSlot;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $stats = match ($user->role) {
            'student' => $this->studentStats($user),
            'preceptor' => $this->preceptorStats($user),
            'site_manager' => $this->siteManagerStats($user),
            'coordinator' => $this->coordinatorStats($user),
            'admin' => $this->adminStats(),
            default => [],
        };

        return response()->json($stats);
    }

    private function studentStats(User $user): array
    {
        $profile = $user->studentProfile;

        return [
            'applications_count' => $user->applications()->count(),
            'pending_applications' => $user->applications()->pending()->count(),
            'accepted_applications' => $user->applications()->accepted()->count(),
            'hours_completed' => $profile?->hours_completed ?? 0,
            'prior_hours' => $profile?->prior_hours ?? 0,
            'total_hours' => $profile?->total_hours ?? 0,
            'hours_required' => $profile?->required_hours ?? 0,
            'hours_progress' => $profile?->hours_progress ?? 0,
            'pending_hours' => $user->hourLogs()->pending()->sum('hours_worked'),
            'active_rotations' => $user->applications()->accepted()
                ->whereHas('slot', fn ($q) => $q->where('end_date', '>=', now()))
                ->count(),
        ];
    }

    private function preceptorStats(User $user): array
    {
        $slotIds = $user->preceptorSlots()->pluck('id');

        return [
            'active_students' => Application::whereIn('slot_id', $slotIds)
                ->accepted()
                ->whereHas('slot', fn ($q) => $q->where('end_date', '>=', now()))
                ->count(),
            'total_slots' => $slotIds->count(),
            'pending_hour_reviews' => HourLog::whereIn('slot_id', $slotIds)->pending()->count(),
            'pending_evaluations' => $user->evaluationsAsPreceptor()
                ->where('is_submitted', false)->count(),
        ];
    }

    private function siteManagerStats(User $user): array
    {
        $siteIds = $user->managedSites()->pluck('id');
        $slotIds = RotationSlot::whereIn('site_id', $siteIds)->pluck('id');

        return [
            'total_sites' => $siteIds->count(),
            'total_slots' => $slotIds->count(),
            'open_slots' => RotationSlot::whereIn('site_id', $siteIds)->open()->count(),
            'pending_applications' => Application::whereIn('slot_id', $slotIds)->pending()->count(),
            'active_students' => Application::whereIn('slot_id', $slotIds)->accepted()
                ->whereHas('slot', fn ($q) => $q->where('end_date', '>=', now()))
                ->count(),
        ];
    }

    private function coordinatorStats(User $user): array
    {
        $universityId = $user->studentProfile?->university_id;
        $studentIds = $universityId
            ? StudentProfile::where('university_id', $universityId)->pluck('user_id')
            : collect();

        return [
            'total_students' => $studentIds->count(),
            'active_placements' => Application::accepted()
                ->whereIn('student_id', $studentIds)
                ->whereHas('slot', fn ($q) => $q->where('end_date', '>=', now()))
                ->count(),
            'pending_applications' => Application::pending()
                ->whereIn('student_id', $studentIds)
                ->count(),
            'total_sites' => RotationSite::active()->count(),
            'available_slots' => RotationSlot::open()->count(),
        ];
    }

    private function adminStats(): array
    {
        return [
            'total_users' => User::count(),
            'total_students' => User::students()->count(),
            'total_preceptors' => User::preceptors()->count(),
            'total_sites' => RotationSite::count(),
            'active_sites' => RotationSite::active()->count(),
            'total_slots' => RotationSlot::count(),
            'open_slots' => RotationSlot::open()->count(),
            'total_applications' => Application::count(),
            'pending_applications' => Application::pending()->count(),
            'total_hours_logged' => HourLog::approved()->sum('hours_worked'),
        ];
    }
}
