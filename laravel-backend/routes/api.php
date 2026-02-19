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
use App\Http\Controllers\MfaController;
use App\Http\Controllers\PasswordResetController;
use App\Http\Controllers\RotationSiteController;
use App\Http\Controllers\RotationSlotController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\SiteInviteController;
use App\Http\Controllers\SiteJoinRequestController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CeCertificateController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\UniversityController;
use App\Http\Controllers\BookmarkController;
use App\Http\Controllers\SavedSearchController;
use App\Http\Controllers\EvaluationTemplateController;
use App\Http\Controllers\AgreementTemplateController;
use App\Http\Controllers\PreceptorReviewController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\PreceptorProfileController;
use App\Http\Controllers\MatchingController;
use App\Http\Controllers\AnalyticsController;
use App\Http\Controllers\AccreditationReportController;
use App\Http\Controllers\SignatureController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\AiChatController;
use App\Http\Controllers\NpiController;
use App\Http\Controllers\SamlController;
use App\Http\Controllers\StudentInviteController;
use App\Http\Controllers\StateRulesController;
use App\Http\Controllers\PractitionerProfileController;
use App\Http\Controllers\Collaborate\PhysicianProfileController;
use App\Http\Controllers\Collaborate\CollaborationRequestController;
use App\Http\Controllers\Collaborate\CollaborationMatchController;
use App\Http\Controllers\Collaborate\SupervisionAgreementController;
use App\Http\Controllers\StripeWebhookController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| All API routes — global rate limiter
|--------------------------------------------------------------------------
*/
// Health check (outside rate limiter for uptime monitoring)
Route::get('/health', fn () => response()->json(['status' => 'ok', 'timestamp' => now()->toIso8601String()]));

Route::middleware('throttle:api')->group(function () {

/*
|--------------------------------------------------------------------------
| Public Routes (rate-limited auth endpoints — stricter limit)
|--------------------------------------------------------------------------
*/

Route::middleware('throttle:10,1')->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register']);
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/forgot-password', [PasswordResetController::class, 'forgotPassword']);
    Route::post('/auth/reset-password', [PasswordResetController::class, 'resetPassword']);
    Route::post('/auth/mfa/verify', [MfaController::class, 'verify']);
    Route::get('/auth/verify-email/{token}', [AuthController::class, 'verifyEmail']);
    Route::post('/auth/resend-verification', [AuthController::class, 'resendVerification']);
});

// Public certificate verification
Route::get('/verify/{certificateNumber}', [CertificateController::class, 'publicVerify']);
Route::get('/verify-ce/{uuid}', [CeCertificateController::class, 'publicVerify']);

// Public invite validation
Route::get('/invite/{token}', [SiteInviteController::class, 'show']);
Route::get('/student-invite/{token}', [StudentInviteController::class, 'show']);

// File downloads (auth handled via query token in controller for window.open() browser tabs)
Route::get('/certificates/{certificate}/pdf', [CertificateController::class, 'downloadPdf']);
Route::get('/ce-certificates/{ceCertificate}/download', [CeCertificateController::class, 'download']);
Route::get('/student/credentials/{credential}/download', [StudentController::class, 'downloadCredentialFile']);

// Export downloads (auth handled via query token in controller for window.open() browser tabs)
Route::get('/exports/hour-logs/csv', [ExportController::class, 'hourLogsCsv']);
Route::get('/exports/hour-logs/pdf', [ExportController::class, 'hourLogsPdf']);
Route::get('/exports/evaluations/csv', [ExportController::class, 'evaluationsCsv']);
Route::get('/exports/evaluations/pdf', [ExportController::class, 'evaluationsPdf']);
Route::get('/exports/compliance/csv', [ExportController::class, 'complianceCsv']);
Route::get('/exports/compliance/pdf', [ExportController::class, 'compliancePdf']);
Route::get('/accreditation-reports/{report}/download', [AccreditationReportController::class, 'download']);

// Stripe webhooks (no auth — signature verified in controller)
Route::post('/stripe/webhook', [PaymentController::class, 'webhook']);
Route::post('/subscription/webhook', [SubscriptionController::class, 'webhook']);

// NPI lookup (public, rate-limited)
Route::get('/npi/lookup', [NpiController::class, 'lookup']);
Route::get('/npi/search', [NpiController::class, 'search']);

// SSO/SAML (public endpoints — ACS receives POST from external IdP)
Route::get('/sso/universities', [SamlController::class, 'universities']);
Route::get('/sso/login/{university}', [SamlController::class, 'login']);
Route::post('/sso/acs/{university}', [SamlController::class, 'acs']);
Route::get('/sso/metadata', [SamlController::class, 'metadata']);

// State rules (public — compliance reference data)
Route::get('/state-rules', [StateRulesController::class, 'index']);
Route::get('/state-rules/{state}', [StateRulesController::class, 'show']);

// Stripe webhooks (public — signature-verified in controller)
Route::post('/webhooks/stripe', [StripeWebhookController::class, 'handle']);

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

    // MFA management (all authenticated users)
    Route::get('/auth/mfa/status', [MfaController::class, 'status']);
    Route::post('/auth/mfa/setup', [MfaController::class, 'setup']);
    Route::post('/auth/mfa/confirm', [MfaController::class, 'confirm']);
    Route::post('/auth/mfa/disable', [MfaController::class, 'disable']);
    Route::post('/auth/mfa/backup-codes', [MfaController::class, 'backupCodes']);

    // Dashboard (all authenticated users — controller scopes by role)
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Notifications (all authenticated users)
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::get('/notifications/preferences', [NotificationController::class, 'getPreferences']);
    Route::put('/notifications/preferences', [NotificationController::class, 'updatePreferences']);
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

    // My University License Codes (coordinator)
    Route::middleware('role:coordinator,admin')
        ->get('/my-university/license-codes', [UniversityController::class, 'myUniversityLicenseCodes']);

    // Prior Hours, Program Management & Bulk Import (coordinator, admin)
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::put('/students/{student}/prior-hours', [StudentController::class, 'setPriorHours']);
        Route::post('/students/assign-program', [StudentController::class, 'assignProgram']);
        Route::post('/students/bulk-prior-hours', [StudentController::class, 'bulkSetPriorHours']);
        Route::get('/students/import-template', [StudentController::class, 'importTemplate']);
        Route::post('/students/bulk-import', [StudentController::class, 'bulkImport']);
        Route::put('/programs/{program}', [UniversityController::class, 'updateProgram']);
        Route::post('/universities/{university}/programs', [UniversityController::class, 'storeProgram']);
    });

    // Student Profile read (students, coordinators, professors need university_id for CE Policy etc.)
    Route::middleware('role:student,coordinator,professor')
        ->get('/student/profile', [StudentController::class, 'profile']);

    // Student Profile updates & Credentials (students + practitioners)
    Route::middleware('role:student,practitioner')->group(function () {
        Route::put('/student/profile', [StudentController::class, 'updateProfile']);
        Route::get('/student/credentials', [StudentController::class, 'credentials']);
        Route::post('/student/credentials', [StudentController::class, 'storeCredential']);
        Route::put('/student/credentials/{credential}', [StudentController::class, 'updateCredential']);
        Route::delete('/student/credentials/{credential}', [StudentController::class, 'deleteCredential']);
        Route::post('/student/credentials/{credential}/upload', [StudentController::class, 'uploadCredentialFile']);
        // download moved to public routes (auth via query token for window.open)
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

    // E-Signatures
    Route::get('/signatures/pending', [SignatureController::class, 'myPending']);
    Route::middleware('role:coordinator,site_manager,admin')->group(function () {
        Route::get('/agreements/{agreement}/signatures', [SignatureController::class, 'index']);
        Route::post('/agreements/{agreement}/signatures', [SignatureController::class, 'requestSignature']);
        Route::post('/signatures/{signature}/resend', [SignatureController::class, 'resend']);
        Route::put('/signatures/{signature}/cancel', [SignatureController::class, 'cancel']);
    });
    Route::put('/signatures/{signature}/sign', [SignatureController::class, 'sign']);
    Route::put('/signatures/{signature}/reject', [SignatureController::class, 'reject']);

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
        Route::post('/site-invites/bulk', [SiteInviteController::class, 'bulkStore']);
        Route::post('/site-invites/{invite}/resend', [SiteInviteController::class, 'resend']);
        Route::delete('/site-invites/{invite}', [SiteInviteController::class, 'destroy']);
    });
    Route::post('/invite/{token}/accept', [SiteInviteController::class, 'accept']);
    Route::get('/my-pending-invites', [SiteInviteController::class, 'myPendingInvites']);

    // Student Invites (coordinator creates; student accepts)
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::get('/student-invites', [StudentInviteController::class, 'index']);
        Route::post('/student-invites', [StudentInviteController::class, 'store']);
        Route::post('/student-invites/bulk', [StudentInviteController::class, 'bulkStore']);
        Route::post('/student-invites/{invite}/resend', [StudentInviteController::class, 'resend']);
        Route::delete('/student-invites/{invite}', [StudentInviteController::class, 'destroy']);
    });
    Route::post('/student-invite/{token}/accept', [StudentInviteController::class, 'accept']);

    // Site Join Requests (preceptor requests to join a site; manager/admin reviews)
    Route::middleware('role:preceptor')->group(function () {
        Route::post('/site-join-requests', [SiteJoinRequestController::class, 'store']);
        Route::get('/site-join-requests/mine', [SiteJoinRequestController::class, 'myRequests']);
        Route::put('/site-join-requests/{joinRequest}/withdraw', [SiteJoinRequestController::class, 'withdraw']);
    });
    Route::middleware('role:site_manager,admin')->group(function () {
        Route::get('/site-join-requests', [SiteJoinRequestController::class, 'index']);
        Route::put('/site-join-requests/{joinRequest}/approve', [SiteJoinRequestController::class, 'approve']);
        Route::put('/site-join-requests/{joinRequest}/deny', [SiteJoinRequestController::class, 'deny']);
    });

    // CE Certificates (preceptor, coordinator, admin) — download moved to public routes
    Route::middleware('role:preceptor,coordinator,admin')->group(function () {
        Route::get('/ce-certificates', [CeCertificateController::class, 'index']);
        Route::get('/ce-certificates/{ceCertificate}', [CeCertificateController::class, 'show']);
        Route::get('/ce-certificates/{ceCertificate}/audit-trail', [CeCertificateController::class, 'auditTrail']);
    });
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::put('/ce-certificates/{ceCertificate}/approve', [CeCertificateController::class, 'approve']);
        Route::put('/ce-certificates/{ceCertificate}/reject', [CeCertificateController::class, 'reject']);
        Route::put('/ce-certificates/{ceCertificate}/revoke', [CeCertificateController::class, 'revoke']);
    });
    Route::get('/ce-eligibility/{application}', [CeCertificateController::class, 'checkEligibility']);

    // CE Policies (university-level — coordinator, admin)
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::get('/universities/{university}/ce-policy', [CeCertificateController::class, 'getPolicy']);
        Route::put('/universities/{university}/ce-policy', [CeCertificateController::class, 'upsertPolicy']);
    });

    // Messages (all authenticated users — controller scopes by relationship)
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/conversations/{conversation}', [MessageController::class, 'messages']);
    Route::post('/messages/conversations/{conversation}', [MessageController::class, 'send']);
    Route::post('/messages/conversations', [MessageController::class, 'createConversation']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/users', [MessageController::class, 'searchUsers']);
    Route::middleware('role:coordinator,admin')
        ->post('/messages/broadcast', [MessageController::class, 'broadcast']);

    // Bookmarks (students only)
    Route::middleware('role:student')->group(function () {
        Route::post('/slots/{slot}/bookmark', [BookmarkController::class, 'toggle']);
        Route::get('/slots/bookmarks', [BookmarkController::class, 'index']);
    });

    // Saved Searches (students only)
    Route::middleware('role:student')->group(function () {
        Route::get('/saved-searches', [SavedSearchController::class, 'index']);
        Route::post('/saved-searches', [SavedSearchController::class, 'store']);
        Route::put('/saved-searches/{savedSearch}', [SavedSearchController::class, 'update']);
        Route::delete('/saved-searches/{savedSearch}', [SavedSearchController::class, 'destroy']);
    });

    // Evaluation Templates (any auth can read; coordinator/admin can write)
    Route::get('/evaluation-templates', [EvaluationTemplateController::class, 'index']);
    Route::get('/evaluation-templates/{template}', [EvaluationTemplateController::class, 'show']);
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::post('/evaluation-templates', [EvaluationTemplateController::class, 'store']);
        Route::put('/evaluation-templates/{template}', [EvaluationTemplateController::class, 'update']);
        Route::delete('/evaluation-templates/{template}', [EvaluationTemplateController::class, 'destroy']);
    });

    // Agreement Templates (coordinator, site_manager, admin)
    Route::middleware('role:coordinator,site_manager,admin')->group(function () {
        Route::get('/agreement-templates', [AgreementTemplateController::class, 'index']);
        Route::post('/agreement-templates', [AgreementTemplateController::class, 'store']);
        Route::put('/agreement-templates/{template}', [AgreementTemplateController::class, 'update']);
        Route::delete('/agreement-templates/{template}', [AgreementTemplateController::class, 'destroy']);
        Route::post('/agreement-templates/{template}/upload', [AgreementTemplateController::class, 'uploadDocument']);
        Route::get('/agreement-templates/{template}/download', [AgreementTemplateController::class, 'downloadDocument']);
    });

    // Preceptor Reviews
    Route::middleware('role:student')->post('/preceptor-reviews', [PreceptorReviewController::class, 'store']);
    Route::get('/preceptor-reviews/{preceptor}', [PreceptorReviewController::class, 'index']);
    Route::get('/preceptor-reviews/{preceptor}/stats', [PreceptorReviewController::class, 'stats']);

    // Payments (Stripe Connect)
    Route::middleware('role:site_manager')->group(function () {
        Route::post('/payments/connect-account', [PaymentController::class, 'createConnectAccount']);
        Route::get('/payments/connect-status', [PaymentController::class, 'connectAccountStatus']);
        Route::post('/payments/connect-refresh', [PaymentController::class, 'refreshConnectLink']);
    });
    Route::middleware('role:student')->post('/payments/checkout', [PaymentController::class, 'createCheckoutSession']);
    Route::get('/payments/history', [PaymentController::class, 'paymentHistory']);
    Route::middleware('role:site_manager,admin')->post('/payments/{payment}/refund', [PaymentController::class, 'refund']);

    // Subscriptions
    Route::get('/subscription/status', [SubscriptionController::class, 'status']);
    Route::post('/subscription/checkout', [SubscriptionController::class, 'createCheckout']);
    Route::post('/subscription/portal', [SubscriptionController::class, 'portal']);

    // NPI Verification (authenticated)
    Route::middleware('role:preceptor,site_manager,practitioner,admin')->post('/npi/verify', [NpiController::class, 'verify']);

    // Preceptor Profiles
    Route::get('/preceptor-profiles', [PreceptorProfileController::class, 'directory']);
    Route::get('/preceptor-profiles/leaderboard', [PreceptorProfileController::class, 'leaderboard']);
    Route::get('/preceptor-profiles/{user}', [PreceptorProfileController::class, 'show']);
    Route::middleware('role:preceptor')->put('/preceptor-profiles', [PreceptorProfileController::class, 'update']);
    Route::middleware('role:admin')->post('/preceptor-profiles/{user}/refresh-badges', [PreceptorProfileController::class, 'refreshBadges']);

    // Smart Matching (student only)
    Route::middleware('role:student')->group(function () {
        Route::get('/matching/preferences', [MatchingController::class, 'preferences']);
        Route::put('/matching/preferences', [MatchingController::class, 'updatePreferences']);
        Route::get('/matching/results', [MatchingController::class, 'match']);
    });

    // Analytics (role-scoped)
    Route::get('/analytics/summary', [AnalyticsController::class, 'summary']);
    Route::get('/analytics/specialty-demand', [AnalyticsController::class, 'specialtyDemand']);
    Route::middleware('role:admin')->get('/analytics/platform', [AnalyticsController::class, 'platform']);
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::get('/analytics/university/{university}', [AnalyticsController::class, 'university']);
        Route::get('/analytics/demand-map', [AnalyticsController::class, 'demandHeatMap']);
    });
    Route::middleware('role:site_manager,admin')->get('/analytics/site/{site}', [AnalyticsController::class, 'site']);

    // Accreditation Reports (coordinator, admin)
    Route::middleware('role:coordinator,admin')->group(function () {
        Route::get('/accreditation-reports', [AccreditationReportController::class, 'index']);
        Route::post('/accreditation-reports', [AccreditationReportController::class, 'generate']);
        Route::get('/accreditation-reports/{report}/preview', [AccreditationReportController::class, 'preview']);
        Route::delete('/accreditation-reports/{report}', [AccreditationReportController::class, 'destroy']);
    });

    // AI Chat (all authenticated users — rate-limited)
    Route::middleware('throttle:30,1')->prefix('ai-chat')->group(function () {
        Route::get('/conversations', [AiChatController::class, 'conversations']);
        Route::get('/conversations/{conversation}', [AiChatController::class, 'messages']);
        Route::post('/send', [AiChatController::class, 'send']);
        Route::delete('/conversations/{conversation}', [AiChatController::class, 'deleteConversation']);
        Route::get('/suggestions', [AiChatController::class, 'suggestions']);
    });

    // Support / Help requests
    Route::post('/support-requests', [\App\Http\Controllers\SupportRequestController::class, 'store']);
    Route::get('/support-requests', [\App\Http\Controllers\SupportRequestController::class, 'index']);

    // Calendar (all authenticated users — controller scopes by role)
    Route::get('/calendar/events', [CalendarController::class, 'events']);

    /*
    |--------------------------------------------------------------------------
    | Admin-only Routes (require admin role via middleware)
    |--------------------------------------------------------------------------
    */
    // ─── Collaborate Module ───
    Route::prefix('collaborate')->group(function () {
        // Physician directory — browsable by practitioners, preceptors, admin
        Route::middleware('role:practitioner,preceptor,admin')->group(function () {
            Route::get('/physician-profiles', [PhysicianProfileController::class, 'index']);
            Route::get('/physician-profiles/{id}', [PhysicianProfileController::class, 'show']);
        });

        // Physician profile CRUD — preceptors only (NPI gate in controller)
        Route::middleware('role:preceptor')->group(function () {
            Route::post('/physician-profiles', [PhysicianProfileController::class, 'store']);
            Route::put('/physician-profiles/{id}', [PhysicianProfileController::class, 'update']);
        });

        // Collaboration requests — practitioners only
        Route::middleware('role:practitioner')->group(function () {
            Route::get('/requests', [CollaborationRequestController::class, 'index']);
            Route::post('/requests', [CollaborationRequestController::class, 'store']);
            Route::get('/requests/{id}', [CollaborationRequestController::class, 'show']);
            Route::put('/requests/{id}', [CollaborationRequestController::class, 'update']);
        });

        // Match listing — practitioners and preceptors can view
        Route::middleware('role:practitioner,preceptor,admin')
            ->get('/matches', [CollaborationMatchController::class, 'index']);

        // Match response — physicians (preceptors) and admin only
        Route::middleware('role:preceptor,admin')
            ->post('/matches/{id}/respond', [CollaborationMatchController::class, 'respond']);

        // Supervision agreements
        Route::middleware('role:practitioner,preceptor,admin')->group(function () {
            Route::get('/agreements', [SupervisionAgreementController::class, 'index']);
            Route::get('/agreements/{id}', [SupervisionAgreementController::class, 'show']);
        });

        Route::middleware('role:preceptor')->group(function () {
            Route::post('/agreements', [SupervisionAgreementController::class, 'store']);
            Route::put('/agreements/{id}', [SupervisionAgreementController::class, 'update']);
        });

        Route::middleware('role:practitioner')
            ->post('/agreements/{id}/activate', [SupervisionAgreementController::class, 'activate']);

        Route::middleware('role:preceptor,admin')
            ->post('/agreements/{id}/pause', [SupervisionAgreementController::class, 'pause']);

        Route::middleware('role:practitioner,preceptor,admin')
            ->post('/agreements/{id}/terminate', [SupervisionAgreementController::class, 'terminate']);
    });

    // ─── Practitioner Profile ───
    Route::middleware('role:practitioner')->group(function () {
        Route::get('/practitioner-profile', [PractitionerProfileController::class, 'show']);
        Route::put('/practitioner-profile', [PractitionerProfileController::class, 'update']);
    });

    Route::middleware('role:admin')->prefix('admin')->group(function () {
        Route::get('/pending-approvals', [AdminController::class, 'pendingApprovals']);
        Route::get('/users', [AdminController::class, 'users']);
        Route::post('/users', [AdminController::class, 'createUser']);
        Route::post('/users/bulk-invite', [AdminController::class, 'bulkInvite']);
        Route::get('/users/{user}', [AdminController::class, 'showUser'])->whereUuid('user');
        Route::put('/users/{user}', [AdminController::class, 'updateUser'])->whereUuid('user');
        Route::delete('/users/{user}', [AdminController::class, 'deleteUser'])->whereUuid('user');
        Route::post('/users/{user}/reset-password', [AdminController::class, 'resetUserPassword'])->whereUuid('user');
        Route::post('/users/{user}/assign-sites', [AdminController::class, 'assignPreceptorToSites'])->whereUuid('user');
        Route::delete('/users/{user}/remove-site/{site}', [AdminController::class, 'removePreceptorFromSite'])->whereUuid('user');
        Route::post('/users/{user}/assign-managed-sites', [AdminController::class, 'assignSiteManagerToSites'])->whereUuid('user');
        Route::delete('/users/{user}/remove-managed-site/{site}', [AdminController::class, 'removeSiteManagerFromSite'])->whereUuid('user');
        Route::post('/sites/{site}/assign-manager', [AdminController::class, 'assignManagerToSite']);
        Route::post('/seed-universities', [AdminController::class, 'seedUniversities']);
        Route::post('/test-email', [AdminController::class, 'testEmail']);
        Route::get('/audit-logs', [AdminController::class, 'auditLogs']);

        Route::post('/universities', [UniversityController::class, 'store']);
        Route::put('/universities/{university}', [UniversityController::class, 'update']);
        Route::delete('/universities/{university}', [UniversityController::class, 'destroy']);
        Route::put('/universities/{university}/saml', [SamlController::class, 'updateSaml']);

        Route::get('/university-codes', [AdminController::class, 'listLicenseCodes']);
        Route::post('/university-codes', [AdminController::class, 'createLicenseCode']);
        Route::delete('/university-codes/{code}', [AdminController::class, 'deactivateLicenseCode']);
    });
});

}); // end throttle:api
