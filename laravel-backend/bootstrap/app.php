<?php

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        health: '/up',
    )
    ->withSchedule(function (Schedule $schedule) {
        $schedule->command('rotations:auto-complete')->dailyAt('02:00');
        $schedule->command('sanctum:prune-expired --hours=48')->dailyAt('03:00');
        $schedule->command('reminders:credentials')->dailyAt('04:00');
        $schedule->command('reminders:agreements')->dailyAt('04:30');
        $schedule->command('reminders:evaluations')->dailyAt('05:00');
        $schedule->command('alerts:saved-searches')->dailyAt('06:00');
        $schedule->command('analytics:cache')->dailyAt('01:00');
    })
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);

        $middleware->append(\App\Http\Middleware\SecurityHeaders::class);

        $middleware->alias([
            'verified' => \Illuminate\Auth\Middleware\EnsureEmailIsVerified::class,
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->booting(function () {
        RateLimiter::for('api', function (Request $request) {
            return $request->user()
                ? Limit::perMinute(120)->by($request->user()->id)
                : Limit::perMinute(60)->by($request->ip());
        });
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
