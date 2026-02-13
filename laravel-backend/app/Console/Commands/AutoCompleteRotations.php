<?php

namespace App\Console\Commands;

use App\Models\Application;
use App\Models\Evaluation;
use App\Models\HourLog;
use App\Models\User;
use App\Notifications\CeCertificateIssuedNotification;
use App\Services\CECertificateGenerator;
use App\Services\CEEligibilityService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoCompleteRotations extends Command
{
    protected $signature = 'rotations:auto-complete
        {--dry-run : Preview without making changes}';

    protected $description = 'Auto-complete rotations where end date has passed, hours are approved, and evaluation is submitted';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        // Find accepted applications where the rotation has ended
        $applications = Application::where('status', 'accepted')
            ->whereHas('slot', fn ($q) => $q->where('end_date', '<', now()))
            ->with(['slot.site', 'student.studentProfile'])
            ->get();

        $this->info("Found {$applications->count()} accepted applications with past end dates.");

        $completed = 0;
        $ceCreated = 0;
        $skipped = 0;

        foreach ($applications as $application) {
            $slot = $application->slot;
            $studentId = $application->student_id;

            // Check: has at least 1 approved hour log
            $hasApprovedHours = HourLog::where('student_id', $studentId)
                ->where('slot_id', $slot->id)
                ->where('status', 'approved')
                ->exists();

            if (!$hasApprovedHours) {
                $this->line("  Skip: {$application->id} — no approved hours");
                $skipped++;
                continue;
            }

            // Check: has a submitted evaluation (final preferred, mid_rotation acceptable)
            $hasEvaluation = Evaluation::where('student_id', $studentId)
                ->where('slot_id', $slot->id)
                ->where('is_submitted', true)
                ->exists();

            if (!$hasEvaluation) {
                $this->line("  Skip: {$application->id} — no submitted evaluation");
                $skipped++;
                continue;
            }

            if ($dryRun) {
                $this->info("  [DRY RUN] Would complete: {$application->id} (slot: {$slot->title ?? $slot->id})");
                $completed++;
                continue;
            }

            // Mark as completed
            $application->update(['status' => 'completed']);
            $completed++;

            $this->info("  Completed: {$application->id} — {$slot->title ?? 'Rotation'}");

            // Check CE eligibility and create CE cert if eligible
            $eligibilityService = new CEEligibilityService();
            $eligibility = $eligibilityService->check($application);

            if ($eligibility['eligible']) {
                $generator = new CECertificateGenerator();
                $ceCert = $generator->createFromEligibility($application, $eligibility);
                $ceCreated++;

                $this->info("    CE cert created: {$ceCert->contact_hours}h — status: {$ceCert->status}");

                // Notify the preceptor
                if ($slot->preceptor_id) {
                    $preceptor = User::find($slot->preceptor_id);
                    if ($preceptor) {
                        $ceCert->load(['university', 'application.slot.site', 'application.student']);
                        $preceptor->notify(new CeCertificateIssuedNotification($ceCert));
                        $this->info("    Notified preceptor: {$preceptor->first_name} {$preceptor->last_name}");
                    }
                }
            } else {
                $this->line("    CE not eligible: {$eligibility['reason']}");
            }

            Log::info('Auto-completed rotation', [
                'application_id' => $application->id,
                'slot_id' => $slot->id,
                'ce_eligible' => $eligibility['eligible'],
                'ce_reason' => $eligibility['reason'],
            ]);
        }

        $this->newLine();
        $this->info("Summary: {$completed} completed, {$ceCreated} CE certs created, {$skipped} skipped.");

        return self::SUCCESS;
    }
}
