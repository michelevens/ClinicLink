<?php

namespace App\Console\Commands;

use App\Mail\SavedSearchAlertMail;
use App\Models\RotationSlot;
use App\Models\SavedSearch;
use App\Notifications\SavedSearchAlertNotification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendSavedSearchAlerts extends Command
{
    protected $signature = 'alerts:saved-searches
        {--dry-run : Preview without sending notifications}';

    protected $description = 'Notify users when new rotation slots match their saved searches';

    public function handle(): int
    {
        $dryRun = $this->option('dry-run');

        $searches = SavedSearch::where('alerts_enabled', true)
            ->with('user')
            ->get();

        if ($searches->isEmpty()) {
            $this->info('No saved searches with alerts enabled.');
            return self::SUCCESS;
        }

        $this->info("Processing {$searches->count()} saved search(es)...");

        $totalNotified = 0;

        foreach ($searches as $search) {
            $user = $search->user;
            if (!$user || !$user->is_active) continue;

            $query = RotationSlot::with(['site', 'preceptor'])
                ->where('status', 'open');

            // Apply saved filters
            $filters = $search->filters ?? [];

            if (!empty($filters['search'])) {
                $s = $filters['search'];
                $query->where(function ($q) use ($s) {
                    $q->where('title', 'ilike', "%{$s}%")
                      ->orWhere('specialty', 'ilike', "%{$s}%")
                      ->orWhereHas('site', fn($sq) => $sq->where('name', 'ilike', "%{$s}%")->orWhere('city', 'ilike', "%{$s}%"));
                });
            }

            if (!empty($filters['specialty'])) {
                $query->where('specialty', 'ilike', "%{$filters['specialty']}%");
            }

            if (!empty($filters['cost_type'])) {
                $query->where('cost_type', $filters['cost_type']);
            }

            // Only new slots since last check
            if ($search->last_checked_at) {
                $query->where('created_at', '>', $search->last_checked_at);
            }

            $newSlots = $query->orderBy('start_date')->get();

            if ($newSlots->isEmpty()) {
                $search->update(['last_checked_at' => now()]);
                continue;
            }

            $this->line("  {$search->name} ({$user->email}): {$newSlots->count()} new slot(s)");

            if (!$dryRun) {
                try {
                    // In-app notification
                    $user->notify(new SavedSearchAlertNotification($search, $newSlots));

                    // Email notification
                    Mail::to($user->email)->send(new SavedSearchAlertMail($user, $search, $newSlots));

                    $search->update(['last_checked_at' => now()]);
                    $totalNotified++;
                } catch (\Throwable $e) {
                    $this->error("  Failed for {$user->email}: {$e->getMessage()}");
                    Log::warning('Saved search alert failed', [
                        'search_id' => $search->id,
                        'error' => $e->getMessage(),
                    ]);
                }
            } else {
                $this->info("  [DRY RUN] Would notify {$user->email}");
                $totalNotified++;
                $search->update(['last_checked_at' => now()]);
            }
        }

        $this->newLine();
        $this->info("Done. Notified {$totalNotified} user(s).");

        return self::SUCCESS;
    }
}
