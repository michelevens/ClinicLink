<?php

namespace App\Console\Commands;

use App\Mail\CredentialExpirationMail;
use App\Models\Credential;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendCredentialExpirationReminders extends Command
{
    protected $signature = 'reminders:credentials
        {--dry-run : Preview without sending emails}';

    protected $description = 'Send email reminders for credentials expiring within 30 days';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $credentials = Credential::whereNotNull('expiration_date')
            ->whereBetween('expiration_date', [now(), now()->addDays(30)])
            ->with('user')
            ->get();

        if ($credentials->isEmpty()) {
            $this->info('No credentials expiring within 30 days.');
            return self::SUCCESS;
        }

        $grouped = $credentials->groupBy('user_id');

        $this->info("Found {$credentials->count()} expiring credential(s) across {$grouped->count()} user(s).");

        $sent = 0;
        $failed = 0;

        foreach ($grouped as $userId => $userCredentials) {
            $user = $userCredentials->first()->user;

            if (!$user || !$user->email) {
                $this->line("  Skip: user {$userId} — no email");
                continue;
            }

            if ($dryRun) {
                $names = $userCredentials->pluck('name')->join(', ');
                $this->info("  [DRY RUN] Would email {$user->email}: {$userCredentials->count()} credential(s) — {$names}");
                $sent++;
                continue;
            }

            try {
                Mail::to($user->email)->send(
                    new CredentialExpirationMail($user, $userCredentials)
                );
                $sent++;
                $this->info("  Sent to {$user->email}: {$userCredentials->count()} credential(s)");
            } catch (\Throwable $e) {
                $failed++;
                $this->error("  Failed for {$user->email}: {$e->getMessage()}");
                Log::warning('Credential expiration email failed', [
                    'user_id' => $userId,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $this->newLine();
        $this->info("Summary: {$sent} sent, {$failed} failed.");

        return self::SUCCESS;
    }
}
