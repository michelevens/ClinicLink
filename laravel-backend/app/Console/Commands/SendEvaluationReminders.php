<?php

namespace App\Console\Commands;

use App\Mail\EvaluationReminderMail;
use App\Models\Application;
use App\Models\Evaluation;
use App\Notifications\EvaluationDueNotification;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendEvaluationReminders extends Command
{
    protected $signature = 'reminders:evaluations
        {--dry-run : Preview without sending emails or notifications}';

    protected $description = 'Send reminders for upcoming mid-rotation and final evaluations';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');
        $today = Carbon::today();

        $applications = Application::where('status', 'accepted')
            ->whereHas('slot', function ($q) use ($today) {
                $q->where('start_date', '<=', $today)
                  ->where('end_date', '>=', $today);
            })
            ->with(['student', 'slot.preceptor', 'slot.site'])
            ->get();

        if ($applications->isEmpty()) {
            $this->info('No active rotations found.');
            return self::SUCCESS;
        }

        $this->info("Found {$applications->count()} active rotation(s). Checking evaluation deadlines...");

        $sent = 0;
        $skipped = 0;
        $failed = 0;

        foreach ($applications as $application) {
            $slot = $application->slot;
            $preceptor = $slot->preceptor;

            if (!$preceptor || !$preceptor->email) {
                $this->line("  Skip: slot {$slot->id} — no preceptor assigned");
                $skipped++;
                continue;
            }

            $startDate = Carbon::parse($slot->start_date);
            $endDate = Carbon::parse($slot->end_date);
            $midpoint = $startDate->copy()->addDays((int) $startDate->diffInDays($endDate) / 2);

            // Mid-rotation evaluation reminders
            $this->processReminder(
                application: $application,
                preceptor: $preceptor,
                slot: $slot,
                evaluationType: 'mid_rotation',
                dueDate: $midpoint,
                today: $today,
                dryRun: $dryRun,
                sent: $sent,
                skipped: $skipped,
                failed: $failed,
            );

            // Final evaluation reminders
            $this->processReminder(
                application: $application,
                preceptor: $preceptor,
                slot: $slot,
                evaluationType: 'final',
                dueDate: $endDate,
                today: $today,
                dryRun: $dryRun,
                sent: $sent,
                skipped: $skipped,
                failed: $failed,
            );
        }

        $this->newLine();
        $this->info("Summary: {$sent} sent, {$skipped} skipped, {$failed} failed.");

        return self::SUCCESS;
    }

    private function processReminder(
        Application $application,
        $preceptor,
        $slot,
        string $evaluationType,
        Carbon $dueDate,
        Carbon $today,
        bool $dryRun,
        int &$sent,
        int &$skipped,
        int &$failed,
    ): void {
        // Check if evaluation already submitted
        $alreadySubmitted = Evaluation::where('slot_id', $slot->id)
            ->where('student_id', $application->student_id)
            ->where('preceptor_id', $preceptor->id)
            ->where('type', $evaluationType)
            ->where('is_submitted', true)
            ->exists();

        if ($alreadySubmitted) {
            return;
        }

        $sevenDaysBefore = $dueDate->copy()->subDays(7);
        $typeLabel = str_replace('_', '-', $evaluationType);
        $studentName = $application->student->full_name;

        // Determine which reminder window applies today
        $window = null;
        if ($today->isSameDay($sevenDaysBefore)) {
            $window = '7_days_before';
        } elseif ($today->isSameDay($dueDate)) {
            $window = 'due_date';
        }

        if (!$window) {
            return;
        }

        // Check if already sent
        $alreadySent = DB::table('evaluation_reminders_sent')
            ->where('application_id', $application->id)
            ->where('evaluation_type', $evaluationType)
            ->where('reminder_window', $window)
            ->exists();

        if ($alreadySent) {
            return;
        }

        $windowLabel = $window === '7_days_before' ? '7 days before' : 'due today';

        if ($dryRun) {
            $this->info("  [DRY RUN] Would remind {$preceptor->email}: {$typeLabel} eval for {$studentName} ({$windowLabel})");
            $sent++;
            return;
        }

        try {
            // Send email
            Mail::to($preceptor->email)->send(
                new EvaluationReminderMail(
                    preceptor: $preceptor,
                    student: $application->student,
                    slot: $slot,
                    evaluationType: $evaluationType,
                    dueDate: $dueDate,
                )
            );

            // Send in-app notification
            $preceptor->notify(new EvaluationDueNotification(
                application: $application,
                evaluationType: $evaluationType,
                dueDate: $dueDate,
            ));

            // Record to prevent re-sends
            DB::table('evaluation_reminders_sent')->insert([
                'id' => \Illuminate\Support\Str::uuid(),
                'application_id' => $application->id,
                'evaluation_type' => $evaluationType,
                'reminder_window' => $window,
                'sent_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $sent++;
            $this->info("  Sent to {$preceptor->email}: {$typeLabel} eval for {$studentName} ({$windowLabel})");
        } catch (\Throwable $e) {
            $failed++;
            $this->error("  Failed for {$preceptor->email}: {$e->getMessage()}");
            Log::warning('Evaluation reminder failed', [
                'application_id' => $application->id,
                'evaluation_type' => $evaluationType,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
