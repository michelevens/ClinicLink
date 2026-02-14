<?php

namespace App\Http\Controllers;

use App\Models\AffiliationAgreement;
use App\Models\Application;
use App\Models\Evaluation;
use App\Models\HourLog;
use App\Models\RotationSlot;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function events(Request $request): JsonResponse
    {
        $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date'],
        ]);

        $user = $request->user();
        $start = $request->input('start');
        $end = $request->input('end');

        $events = match ($user->role) {
            'student' => $this->studentEvents($user, $start, $end),
            'preceptor' => $this->preceptorEvents($user, $start, $end),
            'site_manager' => $this->siteManagerEvents($user, $start, $end),
            'coordinator', 'professor' => $this->coordinatorEvents($user, $start, $end),
            'admin' => $this->adminEvents($start, $end),
            default => [],
        };

        return response()->json($events);
    }

    private function studentEvents(User $user, string $start, string $end): array
    {
        $events = [];

        // Rotations (accepted applications with date ranges)
        $applications = Application::where('student_id', $user->id)
            ->accepted()
            ->whereHas('slot', fn ($q) => $q->where('start_date', '<=', $end)->where('end_date', '>=', $start))
            ->with('slot.site:id,name')
            ->get();

        foreach ($applications as $app) {
            $events[] = [
                'id' => "rotation-{$app->id}",
                'title' => $app->slot->title . ' @ ' . $app->slot->site->name,
                'start' => $app->slot->start_date->toDateString(),
                'end' => $app->slot->end_date->addDay()->toDateString(),
                'allDay' => true,
                'color' => '#3b82f6',
                'type' => 'rotation',
                'meta' => [
                    'entity_id' => $app->id,
                    'link' => '/applications',
                    'description' => $app->slot->specialty . ' rotation',
                ],
            ];

            // Rotation end deadline
            if ($app->slot->end_date->between($start, $end)) {
                $events[] = [
                    'id' => "deadline-{$app->id}",
                    'title' => 'Rotation ends: ' . $app->slot->title,
                    'start' => $app->slot->end_date->toDateString(),
                    'allDay' => true,
                    'color' => '#ef4444',
                    'type' => 'deadline',
                    'meta' => [
                        'entity_id' => $app->id,
                        'link' => '/applications',
                        'description' => 'Last day of rotation',
                    ],
                ];
            }
        }

        // Hour logs
        $hourLogs = HourLog::where('student_id', $user->id)
            ->whereBetween('date', [$start, $end])
            ->with('slot:id,title')
            ->get();

        foreach ($hourLogs as $log) {
            $statusColor = $log->status === 'approved' ? '#22c55e' : ($log->status === 'rejected' ? '#ef4444' : '#f59e0b');
            $events[] = [
                'id' => "hourlog-{$log->id}",
                'title' => "{$log->hours_worked}h — {$log->category}",
                'start' => $log->date->toDateString(),
                'allDay' => true,
                'color' => $statusColor,
                'type' => 'hour_log',
                'meta' => [
                    'entity_id' => $log->id,
                    'link' => '/hours',
                    'description' => "{$log->hours_worked} hours ({$log->status})" . ($log->slot ? " — {$log->slot->title}" : ''),
                ],
            ];
        }

        // Evaluations
        $evaluations = Evaluation::where('student_id', $user->id)
            ->submitted()
            ->whereBetween('created_at', [$start, $end])
            ->with('preceptor:id,first_name,last_name')
            ->get();

        foreach ($evaluations as $eval) {
            $events[] = [
                'id' => "eval-{$eval->id}",
                'title' => ucfirst($eval->type) . ' evaluation',
                'start' => $eval->created_at->toDateString(),
                'allDay' => true,
                'color' => '#f97316',
                'type' => 'evaluation',
                'meta' => [
                    'entity_id' => $eval->id,
                    'link' => '/evaluations',
                    'description' => "By {$eval->preceptor->full_name} — Score: {$eval->overall_score}",
                ],
            ];
        }

        return $events;
    }

    private function preceptorEvents(User $user, string $start, string $end): array
    {
        $events = [];
        $slotIds = $user->preceptorSlots()->pluck('id');

        // Assigned student rotations
        $slots = RotationSlot::whereIn('id', $slotIds)
            ->where('start_date', '<=', $end)
            ->where('end_date', '>=', $start)
            ->with('site:id,name')
            ->get();

        foreach ($slots as $slot) {
            $studentCount = Application::where('slot_id', $slot->id)->accepted()->count();
            $events[] = [
                'id' => "slot-{$slot->id}",
                'title' => "{$slot->title} ({$studentCount} students)",
                'start' => $slot->start_date->toDateString(),
                'end' => $slot->end_date->addDay()->toDateString(),
                'allDay' => true,
                'color' => '#3b82f6',
                'type' => 'rotation',
                'meta' => [
                    'entity_id' => $slot->id,
                    'link' => '/students',
                    'description' => "{$slot->specialty} @ {$slot->site->name}",
                ],
            ];
        }

        // Pending hour log reviews
        $pendingLogs = HourLog::whereIn('slot_id', $slotIds)
            ->pending()
            ->whereBetween('date', [$start, $end])
            ->with('student:id,first_name,last_name')
            ->get();

        foreach ($pendingLogs as $log) {
            $events[] = [
                'id' => "review-{$log->id}",
                'title' => "Review: {$log->student->full_name} ({$log->hours_worked}h)",
                'start' => $log->date->toDateString(),
                'allDay' => true,
                'color' => '#f59e0b',
                'type' => 'hour_log',
                'meta' => [
                    'entity_id' => $log->id,
                    'link' => '/hours',
                    'description' => "Pending review — {$log->category}",
                ],
            ];
        }

        // Due evaluations
        $dueEvals = Evaluation::where('preceptor_id', $user->id)
            ->where('is_submitted', false)
            ->whereBetween('created_at', [$start, $end])
            ->with('student:id,first_name,last_name')
            ->get();

        foreach ($dueEvals as $eval) {
            $events[] = [
                'id' => "eval-due-{$eval->id}",
                'title' => "Due: {$eval->type} eval for {$eval->student->full_name}",
                'start' => $eval->created_at->toDateString(),
                'allDay' => true,
                'color' => '#f97316',
                'type' => 'evaluation',
                'meta' => [
                    'entity_id' => $eval->id,
                    'link' => '/evaluations',
                    'description' => 'Evaluation not yet submitted',
                ],
            ];
        }

        return $events;
    }

    private function siteManagerEvents(User $user, string $start, string $end): array
    {
        $events = [];
        $siteIds = $user->managedSites()->pluck('id');

        // All slots at their sites
        $slots = RotationSlot::whereIn('site_id', $siteIds)
            ->where('start_date', '<=', $end)
            ->where('end_date', '>=', $start)
            ->with('site:id,name', 'preceptor:id,first_name,last_name')
            ->get();

        foreach ($slots as $slot) {
            $events[] = [
                'id' => "slot-{$slot->id}",
                'title' => "{$slot->title} ({$slot->filled}/{$slot->capacity})",
                'start' => $slot->start_date->toDateString(),
                'end' => $slot->end_date->addDay()->toDateString(),
                'allDay' => true,
                'color' => '#3b82f6',
                'type' => 'rotation',
                'meta' => [
                    'entity_id' => $slot->id,
                    'link' => '/slots',
                    'description' => "{$slot->specialty}" . ($slot->preceptor ? " — Preceptor: {$slot->preceptor->full_name}" : ''),
                ],
            ];
        }

        // Pending applications
        $slotIds = RotationSlot::whereIn('site_id', $siteIds)->pluck('id');
        $pendingApps = Application::whereIn('slot_id', $slotIds)
            ->pending()
            ->whereBetween('created_at', [$start, $end])
            ->with('student:id,first_name,last_name', 'slot:id,title')
            ->get();

        foreach ($pendingApps as $app) {
            $events[] = [
                'id' => "app-{$app->id}",
                'title' => "Application: {$app->student->full_name}",
                'start' => $app->created_at->toDateString(),
                'allDay' => true,
                'color' => '#f59e0b',
                'type' => 'application',
                'meta' => [
                    'entity_id' => $app->id,
                    'link' => '/site-applications',
                    'description' => "For {$app->slot->title}",
                ],
            ];
        }

        return $events;
    }

    private function coordinatorEvents(User $user, string $start, string $end): array
    {
        $events = [];
        $universityId = $user->studentProfile?->university_id;

        if (!$universityId) {
            return $events;
        }

        $studentIds = StudentProfile::where('university_id', $universityId)->pluck('user_id');

        // Student placements
        $applications = Application::whereIn('student_id', $studentIds)
            ->accepted()
            ->whereHas('slot', fn ($q) => $q->where('start_date', '<=', $end)->where('end_date', '>=', $start))
            ->with('slot.site:id,name', 'student:id,first_name,last_name')
            ->get();

        foreach ($applications as $app) {
            $events[] = [
                'id' => "placement-{$app->id}",
                'title' => "{$app->student->full_name} @ {$app->slot->site->name}",
                'start' => $app->slot->start_date->toDateString(),
                'end' => $app->slot->end_date->addDay()->toDateString(),
                'allDay' => true,
                'color' => '#3b82f6',
                'type' => 'rotation',
                'meta' => [
                    'entity_id' => $app->id,
                    'link' => '/placements',
                    'description' => "{$app->slot->specialty} — {$app->slot->title}",
                ],
            ];
        }

        // Agreement expirations
        $agreements = AffiliationAgreement::where('university_id', $universityId)
            ->where('status', 'active')
            ->whereBetween('end_date', [$start, $end])
            ->with('site:id,name')
            ->get();

        foreach ($agreements as $agreement) {
            $events[] = [
                'id' => "agreement-{$agreement->id}",
                'title' => "Agreement expires: {$agreement->site->name}",
                'start' => $agreement->end_date->toDateString(),
                'allDay' => true,
                'color' => '#ef4444',
                'type' => 'deadline',
                'meta' => [
                    'entity_id' => $agreement->id,
                    'link' => '/agreements',
                    'description' => "Affiliation agreement with {$agreement->site->name}",
                ],
            ];
        }

        // University evaluations
        $evaluations = Evaluation::whereIn('student_id', $studentIds)
            ->submitted()
            ->whereBetween('created_at', [$start, $end])
            ->with('student:id,first_name,last_name')
            ->get();

        foreach ($evaluations as $eval) {
            $events[] = [
                'id' => "eval-{$eval->id}",
                'title' => "{$eval->type} eval: {$eval->student->full_name}",
                'start' => $eval->created_at->toDateString(),
                'allDay' => true,
                'color' => '#f97316',
                'type' => 'evaluation',
                'meta' => [
                    'entity_id' => $eval->id,
                    'link' => '/evaluations',
                    'description' => "Score: {$eval->overall_score}",
                ],
            ];
        }

        return $events;
    }

    private function adminEvents(string $start, string $end): array
    {
        $events = [];

        // All slots (limited to 100 for performance)
        $slots = RotationSlot::where('start_date', '<=', $end)
            ->where('end_date', '>=', $start)
            ->with('site:id,name')
            ->limit(100)
            ->get();

        foreach ($slots as $slot) {
            $events[] = [
                'id' => "slot-{$slot->id}",
                'title' => "{$slot->title} @ {$slot->site->name}",
                'start' => $slot->start_date->toDateString(),
                'end' => $slot->end_date->addDay()->toDateString(),
                'allDay' => true,
                'color' => '#3b82f6',
                'type' => 'rotation',
                'meta' => [
                    'entity_id' => $slot->id,
                    'link' => '/slots',
                    'description' => "{$slot->specialty} ({$slot->filled}/{$slot->capacity})",
                ],
            ];
        }

        return $events;
    }
}
