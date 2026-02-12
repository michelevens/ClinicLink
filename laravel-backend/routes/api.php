<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CertificateController;
use App\Http\Controllers\ComplianceController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\HourLogController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OnboardingTemplateController;
use App\Http\Controllers\OnboardingTaskController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RotationSiteController;
use App\Http\Controllers\RotationSlotController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SiteInviteController;
use App\Http\Controllers\CeCertificateController;
use App\Http\Controllers\UniversityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes (rate-limited auth endpoints)
|--------------------------------------------------------------------------
*/

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);
});

// Public certificate verification
Route::get('/verify/{certificateNumber}', [CertificateController::class, 'publicVerify']);
Route::get('/verify-ce/{uuid}', [CeCertificateController::class, 'publicVerify']);

// Public invite validation
Route::get('/invite/{token}', [SiteInviteController::class, 'show']);

// PDF downloads (auth handled via query token in controller for window.open() browser tabs)
Route::get('/certificates/{certificate}/pdf', [CertificateController::class, 'downloadPdf']);
Route::get('/ce-certificates/{ceCertificate}/download', [CeCertificateController::class, 'download']);

// Public browsing (no sensitive user data)
Route::get('/sites', [RotationSiteController::class, 'index']);
Route::get('/sites/{site}', [RotationSiteController::class, 'show']);
Route::get('/slots', [RotationSlotController::class, 'index']);
Route::get('/slots/{slot}', [RotationSlotController::class, 'show']);
Route::get('/universities', [UniversityController::class, 'index']);
Route::get('/universities/{university}', [UniversityController::class, 'show']);
Route::get('/universities/{university}/programs', [UniversityController::class, 'programs']);

/*
|--------------------------------------------------------------------------
| Protected Routes (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    // Auth (all authenticated users)
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/complete-onboarding', [AuthController::class, 'completeOnboarding']);

    // Dashboard (all authenticated users — controller scopes by role)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Notifications (all authenticated users)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Sites (management — site_manager and admin)
    Route::middleware('role:site_manager,admin')->group(function () {
        Route::post('/sites', [RotationSiteController::class, 'store']);
        Route::put('/sites/{site}', [RotationSiteController::class, 'update']);
        Route::delete('/sites/{site}', [RotationSiteController::class, 'destroy']);
    });
    Route::get('/my-sites', [RotationSiteController::class, 'mySites']);

    // Slots (management — site_manager and admin can create/edit/delete)
    Route::get('/preceptor-options', [RotationSlotController::class, 'preceptors']);
    Route::get('/my-preceptors', [RotationSlotController::class, 'myPreceptors']);
    Route::middleware('role:site_manager,admin')->group(function () {
        Route::post('/slots', [RotationSlotController::class, 'store']);
        Route::put('/slots/{slot}', [RotationSlotController::class, 'update']);
        Route::delete('/slots/{slot}', [RotationSlotController::class, 'destroy']);
    });

    // Applications (controller scopes by role; store is student-only)
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::middleware('role:student')->post('/applications', [ApplicationController::class, 'store']);
    Route::put('/applications/{application}/review', [ApplicationController::class, 'review']);
    Route::middleware('role:student')->put('/applications/{application}/withdraw', [ApplicationController::class, 'withdraw']);
    Route::put('/applications/{application}/complete', [ApplicationController::class, 'complete']);

    // Hour Logs (student creates; preceptor/site_manager/coordinator/admin review)
    Route::get('/hour-logs', [HourLogController::class, 'index']);
    Route::middleware('role:student')->post('/hour-logs', [HourLogController::class, 'store']);
    Route::middleware('role:student')->put('/hour-logs/{hourLog}', [HourLogController::class, 'update']);
    Route::middleware('role:preceptor,site_manager,coordinator,admin')
        ->put('/hour-logs/{hourLog}/review', [HourLogController::class, 'review']);
    Route::middleware('role:student')->delete('/hour-logs/{hourLog}', [HourLogController::class, 'destroy']);
    Route::middleware('role:student')->get('/hour-logs/summary', [HourLogController::class, 'summary']);

    // Evaluations (preceptor/site_manager/admin create; controller scopes reads)
    Route::get('/evaluations', [EvaluationController::class, 'index']);
    Route::get('/evaluations/{evaluation}', [EvaluationController::class, 'show']);
    Route::middleware('role:preceptor,site_manager,admin')
        ->post('/evaluations', [EvaluationController::class, 'store']);
    Route::middleware('role:preceptor,admin')
        ->put('/evaluations/{evaluation}', [EvaluationController::class, 'update']);

    // My Students (preceptor, site_manager, coordinator, professor, admin only)
    Route::middleware('role:preceptor,site_manager,coordinator,professor,admin')
        ->get('/my-students', [StudentController::class, 'myStudents']);

    // Student Profile & Credentials (students only)
    Route::middleware('role:student')->group(function () {
        Route::get('/student/profile', [StudentController::class, 'profile']);
        Route::put('/student/profile', [StudentController::class, 'updateProfile']);
        Route::get('/student/credentials', [StudentController::class, 'credentials']);
        Route::post('/student/credentials', [StudentController::class, 'storeCredential']);
        Route::put('/student/credentials/{credential}', [StudentController::class, 'updateCredential']);
        Route::delete('/student/credentials/{credential}', [StudentController::class, 'deleteCredential']);
        Route::post('/student/credentials/{credential}/upload', [StudentController::class, 'uploadCredentialFile']);
        Route::get('/student/credentials/{credential}/download', [StudentController::class, 'downloadCredentialFile']);
    });

    // Certificates
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::middleware('role:preceptor,site_manager,coordinator,admin')
        ->get('/certificates/eligibility/{slot}/{student}', [CertificateController::class, 'eligibility']);
    Route::get('/certificates/{certificate}', [CertificateController::class, 'show']);
    // PDF download moved to public routes (auth via query token for window.open)
    Route::middleware('role:preceptor,site_manager,admin')
        ->post('/certificates', [CertificateController::class, 'store']);
    Route::middleware('role:preceptor,site_manager,coordinator,admin')
        ->put('/certificates/{certificate}/revoke', [CertificateController::class, 'revoke']);

    // Onboarding Templates (site_manager, coordinator, admin)
    Route::middleware('role:site_manager,coordinator,admin')->group(function () {
        Route::get('/onboarding-templates', [OnboardingTemplateController::class, 'index']);
        Route::get('/onboarding-templates/{template}', [OnboardingTemplateController::class, 'show']);
        Route::post('/onboarding-templates', [OnboardingTemplateController::class, 'store']);
        Route::put('/onboarding-templates/{template}', [OnboardingTemplateController::class, 'update']);
        Route::delete('/onboarding-templates/{template}', [OnboardingTemplateController::class, 'destroy']);
    });

    // Onboarding Tasks (student completes; site_manager verifies)
    Route::get('/onboarding-tasks', [OnboardingTaskController::class, 'index']);
    Route::middleware('role:student')->put('/onboarding-tasks/{task}/complete', [OnboardingTaskController::class, 'complete']);
    Route::middleware('role:student')->put('/onboarding-tasks/{task}/uncomplete', [OnboardingTaskController::class, 'uncomplete']);
    Route::middleware('role:site_manager,admin')->put('/onboarding-tasks/{task}/verify', [OnboardingTaskController::class, 'verify']);
    Route::middleware('role:site_manager,admin')->put('/onboarding-tasks/{task}/unverify', [OnboardingTaskController::class, 'unverify']);
    Route::middleware('role:student')->post('/onboarding-tasks/{task}/upload', [OnboardingTaskController::class, 'uploadFile']);
    Route::get('/onboarding-tasks/{task}/download', [OnboardingTaskController::class, 'downloadFile']);
    Route::get('/applications/{application}/onboarding-progress', [OnboardingTaskController::class, 'applicationProgress']);

    // Affiliation Agreements (coordinator, site_manager, admin)
    Route::middleware('role:coordinator,site_manager,admin')->group(function () {
        Route::get('/agreements', [UniversityController::class, 'agreements']);
        Route::post('/agreements', [UniversityController::class, 'storeAgreement']);
        Route::put('/agreements/{agreement}', [UniversityController::class, 'updateAgreement']);
        Route::post('/agreements/{agreement}/upload', [UniversityController::class, 'uploadAgreementDocument']);
        Route::get('/agreements/{agreement}/download', [UniversityController::class, 'downloadAgreementDocument']);
    });

    // Compliance (student sees own; site_manager, coordinator, professor, admin)
    Route::middleware('role:site_manager,admin')
        ->get('/compliance/site/{site}', [ComplianceController::class, 'site']);
    Route::middleware('role:student,site_manager,coordinator,professor,admin')
        ->get('/compliance/student/{application}', [ComplianceController::class, 'student']);
    Route::middleware('role:coordinator,professor,admin')
        ->get('/compliance/overview', [ComplianceController::class, 'overview']);

    // Site Invites (site_manager creates; any authenticated user can accept)
    Route::middleware('role:site_manager,admin')->group(function () {
        Route::get('/site-invites', [SiteInviteController::class, 'index']);
        Route::post('/site-invites', [SiteInviteController::class, 'store']);
        Route::delete('/site-invites/{invite}', [SiteInviteController::class, 'destroy']);
    });
    Route::post('/invite/{token}/accept', [SiteInviteController::class, 'accept']);

    // CE Certificates (preceptor, coordinator, admin) — download moved to public routes
    Route::middleware('role:preceptor,coordinator,admin')->group(function () {
        Route::get('/ce-certificates', [CeCertificateController::class, 'index']);
        Route::get('/ce-certificates/{ceCertificate}', [CeCertificateController::class, 'show']);
    });
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::put('/ce-certificates/{ceCertificate}/approve', [CeCertificateController::class, 'approve']);
        Route::put('/ce-certificates/{ceCertificate}/reject', [CeCertificateController::class, 'reject']);
    });
    Route::get('/ce-eligibility/{application}', [CeCertificateController::class, 'checkEligibility']);

    // CE Policies (university-level — coordinator, admin)
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::get('/universities/{university}/ce-policy', [CeCertificateController::class, 'getPolicy']);
        Route::put('/universities/{university}/ce-policy', [CeCertificateController::class, 'upsertPolicy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin-only Routes (require admin role via middleware)
    |--------------------------------------------------------------------------
    */
    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'users']);
        Route::get('/users/{user}', [AdminController::class, 'showUser']);
        Route::put('/users/{user}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser']);
        Route::post('/seed-universities', [AdminController::class, 'seedUniversities']);

        Route::post('/universities', [UniversityController::class, 'store']);
        Route::put('/universities/{university}', [UniversityController::class, 'update']);
        Route::delete('/universities/{university}', [UniversityController::class, 'destroy']);
    });
});
