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
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);

// Public certificate verification & PDF download (token-based auth)
Route::get('/verify/{certificateNumber}', [CertificateController::class, 'publicVerify']);
Route::get('/certificates/{certificate}/pdf', [CertificateController::class, 'downloadPdf']);

// Public CE certificate verification
Route::get('/verify-ce/{uuid}', [CeCertificateController::class, 'publicVerify']);

// Public invite validation
Route::get('/invite/{token}', [SiteInviteController::class, 'show']);

// Public browsing
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

    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/complete-onboarding', [AuthController::class, 'completeOnboarding']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Sites (management)
    Route::post('/sites', [RotationSiteController::class, 'store']);
    Route::put('/sites/{site}', [RotationSiteController::class, 'update']);
    Route::delete('/sites/{site}', [RotationSiteController::class, 'destroy']);
    Route::get('/my-sites', [RotationSiteController::class, 'mySites']);

    // Slots (management)
    Route::get('/preceptor-options', [RotationSlotController::class, 'preceptors']);
    Route::get('/my-preceptors', [RotationSlotController::class, 'myPreceptors']);
    Route::post('/slots', [RotationSlotController::class, 'store']);
    Route::put('/slots/{slot}', [RotationSlotController::class, 'update']);
    Route::delete('/slots/{slot}', [RotationSlotController::class, 'destroy']);

    // Applications
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::get('/applications/{application}', [ApplicationController::class, 'show']);
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::put('/applications/{application}/review', [ApplicationController::class, 'review']);
    Route::put('/applications/{application}/withdraw', [ApplicationController::class, 'withdraw']);

    // Hour Logs
    Route::get('/hour-logs', [HourLogController::class, 'index']);
    Route::post('/hour-logs', [HourLogController::class, 'store']);
    Route::put('/hour-logs/{hourLog}', [HourLogController::class, 'update']);
    Route::put('/hour-logs/{hourLog}/review', [HourLogController::class, 'review']);
    Route::delete('/hour-logs/{hourLog}', [HourLogController::class, 'destroy']);
    Route::get('/hour-logs/summary', [HourLogController::class, 'summary']);

    // Evaluations
    Route::get('/evaluations', [EvaluationController::class, 'index']);
    Route::get('/evaluations/{evaluation}', [EvaluationController::class, 'show']);
    Route::post('/evaluations', [EvaluationController::class, 'store']);
    Route::put('/evaluations/{evaluation}', [EvaluationController::class, 'update']);

    // My Students (preceptor, coordinator, professor, admin)
    Route::get('/my-students', [StudentController::class, 'myStudents']);

    // Student Profile & Credentials
    Route::get('/student/profile', [StudentController::class, 'profile']);
    Route::put('/student/profile', [StudentController::class, 'updateProfile']);
    Route::get('/student/credentials', [StudentController::class, 'credentials']);
    Route::post('/student/credentials', [StudentController::class, 'storeCredential']);
    Route::put('/student/credentials/{credential}', [StudentController::class, 'updateCredential']);
    Route::delete('/student/credentials/{credential}', [StudentController::class, 'deleteCredential']);
    Route::post('/student/credentials/{credential}/upload', [StudentController::class, 'uploadCredentialFile']);
    Route::get('/student/credentials/{credential}/download', [StudentController::class, 'downloadCredentialFile']);

    // Certificates
    Route::get('/certificates', [CertificateController::class, 'index']);
    Route::get('/certificates/{certificate}', [CertificateController::class, 'show']);
    Route::post('/certificates', [CertificateController::class, 'store']);
    Route::get('/certificates/eligibility/{slot}/{student}', [CertificateController::class, 'eligibility']);
    Route::put('/certificates/{certificate}/revoke', [CertificateController::class, 'revoke']);

    // Admin
    Route::get('/admin/users', [AdminController::class, 'users']);
    Route::get('/admin/users/{user}', [AdminController::class, 'showUser']);
    Route::put('/admin/users/{user}', [AdminController::class, 'updateUser']);
    Route::delete('/admin/users/{user}', [AdminController::class, 'deleteUser']);
    Route::post('/admin/seed-universities', [AdminController::class, 'seedUniversities']);

    // Admin University CRUD
    Route::post('/admin/universities', [UniversityController::class, 'store']);
    Route::put('/admin/universities/{university}', [UniversityController::class, 'update']);
    Route::delete('/admin/universities/{university}', [UniversityController::class, 'destroy']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

    // Onboarding Templates
    Route::get('/onboarding-templates', [OnboardingTemplateController::class, 'index']);
    Route::get('/onboarding-templates/{template}', [OnboardingTemplateController::class, 'show']);
    Route::post('/onboarding-templates', [OnboardingTemplateController::class, 'store']);
    Route::put('/onboarding-templates/{template}', [OnboardingTemplateController::class, 'update']);
    Route::delete('/onboarding-templates/{template}', [OnboardingTemplateController::class, 'destroy']);

    // Onboarding Tasks
    Route::get('/onboarding-tasks', [OnboardingTaskController::class, 'index']);
    Route::put('/onboarding-tasks/{task}/complete', [OnboardingTaskController::class, 'complete']);
    Route::put('/onboarding-tasks/{task}/uncomplete', [OnboardingTaskController::class, 'uncomplete']);
    Route::put('/onboarding-tasks/{task}/verify', [OnboardingTaskController::class, 'verify']);
    Route::put('/onboarding-tasks/{task}/unverify', [OnboardingTaskController::class, 'unverify']);
    Route::post('/onboarding-tasks/{task}/upload', [OnboardingTaskController::class, 'uploadFile']);
    Route::get('/onboarding-tasks/{task}/download', [OnboardingTaskController::class, 'downloadFile']);
    Route::get('/applications/{application}/onboarding-progress', [OnboardingTaskController::class, 'applicationProgress']);

    // Affiliation Agreements
    Route::get('/agreements', [UniversityController::class, 'agreements']);
    Route::post('/agreements', [UniversityController::class, 'storeAgreement']);
    Route::put('/agreements/{agreement}', [UniversityController::class, 'updateAgreement']);
    Route::post('/agreements/{agreement}/upload', [UniversityController::class, 'uploadAgreementDocument']);
    Route::get('/agreements/{agreement}/download', [UniversityController::class, 'downloadAgreementDocument']);

    // Compliance
    Route::get('/compliance/site/{site}', [ComplianceController::class, 'site']);
    Route::get('/compliance/student/{application}', [ComplianceController::class, 'student']);
    Route::get('/compliance/overview', [ComplianceController::class, 'overview']);

    // Site Invites (preceptor invite links)
    Route::get('/site-invites', [SiteInviteController::class, 'index']);
    Route::post('/site-invites', [SiteInviteController::class, 'store']);
    Route::post('/invite/{token}/accept', [SiteInviteController::class, 'accept']);
    Route::delete('/site-invites/{invite}', [SiteInviteController::class, 'destroy']);

    // CE Certificates
    Route::get('/ce-certificates', [CeCertificateController::class, 'index']);
    Route::get('/ce-certificates/{ceCertificate}', [CeCertificateController::class, 'show']);
    Route::put('/ce-certificates/{ceCertificate}/approve', [CeCertificateController::class, 'approve']);
    Route::put('/ce-certificates/{ceCertificate}/reject', [CeCertificateController::class, 'reject']);
    Route::get('/ce-certificates/{ceCertificate}/download', [CeCertificateController::class, 'download']);
    Route::get('/ce-eligibility/{application}', [CeCertificateController::class, 'checkEligibility']);

    // CE Policies (university-level)
    Route::get('/universities/{university}/ce-policy', [CeCertificateController::class, 'getPolicy']);
    Route::put('/universities/{university}/ce-policy', [CeCertificateController::class, 'upsertPolicy']);

    // Application completion (triggers CE)
    Route::put('/applications/{application}/complete', [ApplicationController::class, 'complete']);
});
