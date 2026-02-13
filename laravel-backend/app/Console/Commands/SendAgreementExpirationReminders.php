<?php

namespace App\Console\Commands;

use App\Mail\AgreementExpirationMail;
use App\Models\AffiliationAgreement;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendAgreementExpirationReminders extends Command
{
    protected $signature = 'reminders:agreements
        {--dry-run : Preview without sending emails}';

    protected $description = 'Send email reminders for affiliation agreements expiring within 30 days';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $agreements = AffiliationAgreement::where('status', 'active')
            ->whereBetween('end_date', [now(), now()->addDays(30)])
            ->with(['university', 'site'])
            ->get();

        if ($agreements->isEmpty()) {
            $this->info('No agreements expiring within 30 days.');
            return self::SUCCESS;
        }

        $this->info("Found {$agreements->count()} expiring agreement(s).");

        $sent = 0;
        $failed = 0;

        // Notify coordinators at each university
        $byUniversity = $agreements->groupBy('university_id');

        foreach ($byUniversity as $universityId => $uniAgreements) {
            $coordinators = User::whereIn('role', ['coordinator', 'professor'])
                ->whereHas('studentProfile', fn ($q) => $q->where('university_id', $universityId))
                ->get();

            foreach ($coordinators as $coordinator) {
                if (!$coordinator->email) continue;

                if ($dryRun) {
                    $this->info("  [DRY RUN] Would email coordinator {$coordinator->email}: {$uniAgreements->count()} agreement(s)");
                    $sent++;
                    continue;
                }

                try {
                    Mail::to($coordinator->email)->send(
                        new AgreementExpirationMail($coordinator, $uniAgreements)
                    );
                    $sent++;
                    $this->info("  Sent to coordinator {$coordinator->email}: {$uniAgreements->count()} agreement(s)");
                } catch (\Throwable $e) {
                    $failed++;
                    $this->error("  Failed for {$coordinator->email}: {$e->getMessage()}");
                    Log::warning('Agreement expiration email failed', [
                        'user_id' => $coordinator->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            }
        }

        // Notify site managers for their sites
        $bySite = $agreements->groupBy('site_id');

        foreach ($bySite as $siteId => $siteAgreements) {
            $site = $siteAgreements->first()->site;
            if (!$site || !$site->manager_id) continue;

            $manager = User::find($site->manager_id);
            if (!$manager || !$manager->email) continue;

            if ($dryRun) {
                $this->info("  [DRY RUN] Would email site manager {$manager->email}: {$siteAgreements->count()} agreement(s)");
                $sent++;
                continue;
            }

            try {
                Mail::to($manager->email)->send(
                    new AgreementExpirationMail($manager, $siteAgreements)
                );
                $sent++;
                $this->info("  Sent to site manager {$manager->email}: {$siteAgreements->count()} agreement(s)");
            } catch (\Throwable $e) {
                $failed++;
                $this->error("  Failed for {$manager->email}: {$e->getMessage()}");
                Log::warning('Agreement expiration email failed', [
                    'user_id' => $manager->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("Summary: {$sent} sent, {$failed} failed.");

        return self::SUCCESS;
    }
}
