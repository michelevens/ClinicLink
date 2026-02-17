<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Evaluation;
use App\Models\HourLog;
use App\Models\StudentProfile;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

class ExportController extends Controller
{
    /**
     * Resolve user from Sanctum session or query token (for window.open downloads).
     */
    private function resolveUser(Request $request)
    {
        $user = $request->user();
        if (!$user && $request->filled('token')) {
            $token = PersonalAccessToken::findToken($request->input('token'));
            if ($token) {
                $user = $token->tokenable;
            }
        }
        return $user;
    }

    // ─── Hour Logs ───────────────────────────────────────────────

    private function hourLogsQuery(Request $request, $user)
    {
        $query = HourLog::with(['student', 'slot.site', 'approver']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isPreceptor()) {
            $query->whereHas('slot', fn($q) => $q->where('preceptor_id', $user->id));
        } elseif ($user->isSiteManager()) {
            $query->whereHas('slot.site', fn($q) => $q->where('manager_id', $user->id));
        } elseif ($user->isCoordinator() || $user->role === 'professor') {
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $studentIds = StudentProfile::where('university_id', $universityId)->pluck('user_id');
                $query->whereIn('student_id', $studentIds);
            }
        }

        if ($request->filled('status')) $query->where('status', $request->input('status'));
        if ($request->filled('slot_id')) $query->where('slot_id', $request->input('slot_id'));
        if ($request->filled('date_from')) $query->where('date', '>=', $request->input('date_from'));
        if ($request->filled('date_to')) $query->where('date', '<=', $request->input('date_to'));

        return $query->orderBy('date', 'desc')->get();
    }

    public function hourLogsCsv(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) return response()->json(['message' => 'Unauthorized.'], 401);

        $logs = $this->hourLogsQuery($request, $user);

        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, ['Date', 'Student', 'Rotation', 'Site', 'Hours', 'Category', 'Status', 'Description', 'Approved By']);

        foreach ($logs as $log) {
            fputcsv($handle, [
                $log->date?->format('Y-m-d'),
                $log->student?->full_name ?? '',
                $log->slot?->title ?? '',
                $log->slot?->site?->name ?? '',
                $log->hours_worked,
                ucfirst(str_replace('_', ' ', $log->category)),
                ucfirst($log->status),
                $log->description ?? '',
                $log->approver?->full_name ?? '',
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="hour-logs-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }

    public function hourLogsPdf(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) return response()->json(['message' => 'Unauthorized.'], 401);

        $logs = $this->hourLogsQuery($request, $user);

        $totalHours = $logs->sum('hours_worked');
        $approvedHours = $logs->where('status', 'approved')->sum('hours_worked');
        $pendingHours = $logs->where('status', 'pending')->sum('hours_worked');

        $pdf = Pdf::loadView('exports.hour-logs', compact('logs', 'user', 'totalHours', 'approvedHours', 'pendingHours'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('hour-logs-' . now()->format('Y-m-d') . '.pdf');
    }

    // ─── Evaluations ─────────────────────────────────────────────

    private function evaluationsQuery(Request $request, $user)
    {
        $query = Evaluation::with(['student', 'preceptor', 'slot.site']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id)->submitted();
        } elseif ($user->isPreceptor()) {
            $query->where('preceptor_id', $user->id);
        } elseif ($user->isSiteManager()) {
            $siteIds = $user->managedSites()->pluck('id');
            $query->whereHas('slot', fn($q) => $q->whereIn('site_id', $siteIds));
        } elseif ($user->isCoordinator() || $user->role === 'professor') {
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $studentIds = StudentProfile::where('university_id', $universityId)->pluck('user_id');
                $query->whereIn('student_id', $studentIds);
            }
        }

        if ($request->filled('type')) $query->where('type', $request->input('type'));

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function evaluationsCsv(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) return response()->json(['message' => 'Unauthorized.'], 401);

        $evaluations = $this->evaluationsQuery($request, $user);

        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, ['Date', 'Type', 'Student', 'Preceptor', 'Rotation', 'Site', 'Overall Score', 'Strengths', 'Areas for Improvement', 'Comments']);

        foreach ($evaluations as $eval) {
            fputcsv($handle, [
                $eval->created_at?->format('Y-m-d'),
                ucfirst(str_replace('_', ' ', $eval->type)),
                $eval->student?->full_name ?? '',
                $eval->preceptor?->full_name ?? '',
                $eval->slot?->title ?? '',
                $eval->slot?->site?->name ?? '',
                $eval->overall_score,
                $eval->strengths ?? '',
                $eval->areas_for_improvement ?? '',
                $eval->comments ?? '',
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="evaluations-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }

    public function evaluationsPdf(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) return response()->json(['message' => 'Unauthorized.'], 401);

        $evaluations = $this->evaluationsQuery($request, $user);

        $avgScore = $evaluations->avg('overall_score');

        $pdf = Pdf::loadView('exports.evaluations', compact('evaluations', 'user', 'avgScore'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('evaluations-' . now()->format('Y-m-d') . '.pdf');
    }

    // ─── Compliance ──────────────────────────────────────────────

    private function complianceData(Request $request, $user): array
    {
        $query = Application::with(['student.credentials', 'student.studentProfile', 'slot.site', 'onboardingTasks'])
            ->where('status', 'accepted');

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isSiteManager()) {
            $managedSiteIds = $user->managedSites()->pluck('id');
            if ($request->filled('site_id')) {
                $siteId = $request->input('site_id');
                // Validate site belongs to this manager
                if (!$managedSiteIds->contains($siteId)) {
                    return [];
                }
                $query->whereHas('slot', fn($q) => $q->where('site_id', $siteId));
            } else {
                $query->whereHas('slot', fn($q) => $q->whereIn('site_id', $managedSiteIds));
            }
        } elseif ($user->isCoordinator() || $user->role === 'professor') {
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $studentIds = DB::table('student_profiles')
                    ->where('university_id', $universityId)
                    ->pluck('user_id');
                $query->whereIn('student_id', $studentIds);
            }
        }

        $applications = $query->get();

        return $applications->map(function ($app) {
            $student = $app->student;
            $credentials = $student->credentials;
            $tasks = $app->onboardingTasks;

            $totalCreds = $credentials->count();
            $validCreds = $credentials->filter(fn($c) => !$c->isExpired() && $c->expiration_date !== null)->count();
            $expiredCreds = $credentials->filter(fn($c) => $c->isExpired())->count();
            $expiringSoon = $credentials->filter(fn($c) => $c->isExpiringSoon())->count();

            $totalTasks = $tasks->count();
            $completedTasks = $tasks->whereNotNull('completed_at')->count();
            $verifiedTasks = $tasks->whereNotNull('verified_at')->count();
            $requiredTasks = $tasks->where('is_required', true);
            $requiredComplete = $requiredTasks->filter(fn($t) => $t->completed_at !== null)->count();

            $hasExpired = $expiredCreds > 0;
            $allRequiredDone = $requiredTasks->count() === 0 || $requiredComplete === $requiredTasks->count();
            $overallStatus = $hasExpired ? 'Non-Compliant' : (!$allRequiredDone || $expiringSoon > 0 ? 'In Progress' : 'Compliant');

            return [
                'student_name' => $student->full_name,
                'student_email' => $student->email,
                'rotation' => ($app->slot->title ?? '') . ' - ' . ($app->slot->specialty ?? ''),
                'site_name' => $app->slot->site->name ?? '',
                'overall_status' => $overallStatus,
                'credentials_total' => $totalCreds,
                'credentials_valid' => $validCreds,
                'credentials_expired' => $expiredCreds,
                'credentials_expiring_soon' => $expiringSoon,
                'tasks_total' => $totalTasks,
                'tasks_completed' => $completedTasks,
                'tasks_verified' => $verifiedTasks,
            ];
        })->toArray();
    }

    public function complianceCsv(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) return response()->json(['message' => 'Unauthorized.'], 401);

        $rows = $this->complianceData($request, $user);

        $handle = fopen('php://temp', 'r+');
        fputcsv($handle, ['Student', 'Email', 'Rotation', 'Site', 'Status', 'Credentials Total', 'Credentials Valid', 'Expired', 'Expiring Soon', 'Tasks Total', 'Tasks Completed', 'Tasks Verified']);

        foreach ($rows as $row) {
            fputcsv($handle, [
                $row['student_name'],
                $row['student_email'],
                $row['rotation'],
                $row['site_name'],
                $row['overall_status'],
                $row['credentials_total'],
                $row['credentials_valid'],
                $row['credentials_expired'],
                $row['credentials_expiring_soon'],
                $row['tasks_total'],
                $row['tasks_completed'],
                $row['tasks_verified'],
            ]);
        }

        rewind($handle);
        $csv = stream_get_contents($handle);
        fclose($handle);

        return response($csv, 200, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="compliance-' . now()->format('Y-m-d') . '.csv"',
        ]);
    }

    public function compliancePdf(Request $request)
    {
        $user = $this->resolveUser($request);
        if (!$user) return response()->json(['message' => 'Unauthorized.'], 401);

        $rows = $this->complianceData($request, $user);

        $compliant = collect($rows)->where('overall_status', 'Compliant')->count();
        $total = count($rows);

        $pdf = Pdf::loadView('exports.compliance', compact('rows', 'user', 'compliant', 'total'))
            ->setPaper('a4', 'landscape');

        return $pdf->download('compliance-' . now()->format('Y-m-d') . '.pdf');
    }
}
