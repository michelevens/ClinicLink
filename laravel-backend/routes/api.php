<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\EvaluationController;
use App\Http\Controllers\HourLogController;
use App\Http\Controllers\RotationSiteController;
use App\Http\Controllers\RotationSlotController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\UniversityController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

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

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

    // Sites (management)
    Route::post('/sites', [RotationSiteController::class, 'store']);
    Route::put('/sites/{site}', [RotationSiteController::class, 'update']);
    Route::delete('/sites/{site}', [RotationSiteController::class, 'destroy']);
    Route::get('/my-sites', [RotationSiteController::class, 'mySites']);

    // Slots (management)
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

    // Student Profile & Credentials
    Route::get('/student/profile', [StudentController::class, 'profile']);
    Route::put('/student/profile', [StudentController::class, 'updateProfile']);
    Route::get('/student/credentials', [StudentController::class, 'credentials']);
    Route::post('/student/credentials', [StudentController::class, 'storeCredential']);
    Route::put('/student/credentials/{credential}', [StudentController::class, 'updateCredential']);
    Route::delete('/student/credentials/{credential}', [StudentController::class, 'deleteCredential']);

    // Affiliation Agreements
    Route::get('/agreements', [UniversityController::class, 'agreements']);
    Route::post('/agreements', [UniversityController::class, 'storeAgreement']);
    Route::put('/agreements/{agreement}', [UniversityController::class, 'updateAgreement']);
});
