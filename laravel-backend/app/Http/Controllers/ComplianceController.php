<?php

namespace App\Http\Controllers;

use App\Models\AffiliationAgreement;
use App\Models\Application;
use App\Models\Credential;
use App\Models\OnboardingTask;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ComplianceController extends Controller
{
    /**
     * Site compliance: all students at a given site with their documentation status.
     * For site managers.
     */
    public function site(Request $request, string $siteId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isSiteManager() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($user->isSiteManager() && !$user->managedSites()->where('id', $siteId)->exists()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $applications = Application::with(['student.credentials', 'student.studentProfile', 'slot.site', 'onboardingTasks'])
            ->where('status', 'accepted')
            ->whereHas('slot', fn($q) => $q->where('site_id', $siteId))
            ->get();

        $students = $applications->map(function ($app) use ($siteId) {
            return $this->buildStudentCompliance($app, $siteId);
        });

        return response()->json(['students' => $students]);
    }

    /**
     * Student compliance: their own checklist for a specific application/rotation.
     */
    public function student(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        if ($application->student_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $application->load(['student.credentials', 'student.studentProfile', 'slot.site', 'onboardingTasks']);
        $siteId = $application->slot->site_id;

        $compliance = $this->buildStudentCompliance($application, $siteId);

        return response()->json(['compliance' => $compliance]);
    }

    /**
     * Overview: coordinators see all their students across sites.
     */
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isCoordinator() && !$user->isAdmin() && $user->role !== 'professor') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $query = Application::with(['student.credentials', 'student.studentProfile', 'slot.site', 'onboardingTasks'])
            ->where('status', 'accepted');

        // Coordinators: only students from their university
        if ($user->isCoordinator() || $user->role === 'professor') {
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $studentIds = DB::table('student_profiles')
                    ->where('university_id', $universityId)
                    ->pluck('user_id');
                $query->whereIn('student_id', $studentIds);
            }
        }

        $applications = $query->get();

        // Group by site for aggregate view
        $bySite = $applications->groupBy(fn($app) => $app->slot->site_id);

        $sites = $bySite->map(function ($apps, $siteId) {
            $site = $apps->first()->slot->site;
            $students = $apps->map(fn($app) => $this->buildStudentCompliance($app, $siteId));

            $compliant = $students->filter(fn($s) => $s['overall_status'] === 'compliant')->count();
            $total = $students->count();

            return [
                'site_id' => $siteId,
                'site_name' => $site->name,
                'site_city' => $site->city,
                'site_state' => $site->state,
                'total_students' => $total,
                'compliant_students' => $compliant,
                'compliance_percentage' => $total > 0 ? round(($compliant / $total) * 100) : 100,
                'students' => $students,
            ];
        })->values();

        return response()->json(['sites' => $sites]);
    }

    /**
     * Build compliance data for a single student-application pairing.
     */
    private function buildStudentCompliance(Application $app, string $siteId): array
    {
        $student = $app->student;
        $credentials = $student->credentials;
        $tasks = $app->onboardingTasks;

        // Credential status
        $totalCreds = $credentials->count();
        $validCreds = $credentials->filter(fn($c) => !$c->isExpired() && $c->expiration_date !== null)->count();
        $expiredCreds = $credentials->filter(fn($c) => $c->isExpired())->count();
        $noExpiration = $credentials->filter(fn($c) => $c->expiration_date === null)->count();
        $expiringSoon = $credentials->filter(fn($c) => $c->isExpiringSoon())->count();

        // Onboarding tasks
        $totalTasks = $tasks->count();
        $requiredTasks = $tasks->where('is_required', true);
        $completedTasks = $tasks->whereNotNull('completed_at')->count();
        $verifiedTasks = $tasks->whereNotNull('verified_at')->count();
        $requiredComplete = $requiredTasks->filter(fn($t) => $t->completed_at !== null)->count();
        $requiredVerified = $requiredTasks->filter(fn($t) => $t->verified_at !== null)->count();
        $requiredCount = $requiredTasks->count();
        $tasksWithFiles = $tasks->whereNotNull('file_path')->count();

        // Agreement status
        $universityId = $student->studentProfile?->university_id;
        $agreement = null;
        $agreementStatus = 'none';
        if ($universityId) {
            $agreement = AffiliationAgreement::where('university_id', $universityId)
                ->where('site_id', $siteId)
                ->orderByRaw("CASE status WHEN 'active' THEN 0 WHEN 'pending_review' THEN 1 WHEN 'draft' THEN 2 ELSE 3 END")
                ->first();
            if ($agreement) {
                $agreementStatus = $agreement->isActive() ? 'active' : $agreement->status;
            }
        }

        // Overall status
        $hasExpired = $expiredCreds > 0;
        $allRequiredTasksDone = $requiredCount === 0 || $requiredComplete === $requiredCount;
        $allRequiredTasksVerified = $requiredCount === 0 || $requiredVerified === $requiredCount;
        $hasActiveAgreement = $agreementStatus === 'active';

        $overallStatus = 'compliant';
        if ($hasExpired || !$hasActiveAgreement) {
            $overallStatus = 'non_compliant';
        } elseif (!$allRequiredTasksVerified || $expiringSoon > 0) {
            $overallStatus = 'in_progress';
        }

        return [
            'student_id' => $student->id,
            'student_name' => $student->full_name,
            'student_email' => $student->email,
            'application_id' => $app->id,
            'rotation' => $app->slot->title . ' - ' . $app->slot->specialty,
            'site_name' => $app->slot->site->name,
            'overall_status' => $overallStatus,
            'credentials' => [
                'total' => $totalCreds,
                'valid' => $validCreds,
                'no_expiration' => $noExpiration,
                'expired' => $expiredCreds,
                'expiring_soon' => $expiringSoon,
                'has_files' => $credentials->whereNotNull('file_path')->count(),
            ],
            'tasks' => [
                'total' => $totalTasks,
                'required' => $requiredCount,
                'completed' => $completedTasks,
                'verified' => $verifiedTasks,
                'required_completed' => $requiredComplete,
                'required_verified' => $requiredVerified,
                'with_files' => $tasksWithFiles,
            ],
            'agreement' => [
                'status' => $agreementStatus,
                'id' => $agreement?->id,
                'end_date' => $agreement?->end_date?->toDateString(),
            ],
        ];
    }
}
