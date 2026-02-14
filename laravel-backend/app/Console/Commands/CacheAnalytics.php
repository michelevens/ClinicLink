<?php

namespace App\Console\Commands;

use App\Models\AnalyticsSnapshot;
use App\Models\RotationSite;
use App\Models\University;
use App\Services\AnalyticsService;
use Illuminate\Console\Command;

class CacheAnalytics extends Command
{
    protected $signature = 'analytics:cache {--type=all : Type to cache (all, platform, university, site)} {--period=daily : Period (daily, monthly)} {--dry-run : Show what would be cached without saving}';

    protected $description = 'Cache analytics snapshots for dashboards';

    public function handle(AnalyticsService $analyticsService): int
    {
        $type = $this->option('type');
        $period = $this->option('period');
        $dryRun = $this->option('dry-run');
        $date = now()->toDateString();
        $from = now()->subDays(30)->toDateString();
        $to = $date;

        $this->info("Caching analytics for {$date} (period: {$period})...");

        if ($type === 'all' || $type === 'platform') {
            $this->info('Caching platform analytics...');
            $metrics = $analyticsService->platformMetrics($from, $to);

            if ($dryRun) {
                $this->table(array_keys($metrics), [array_values($metrics)]);
            } else {
                AnalyticsSnapshot::updateOrCreate(
                    ['type' => 'platform', 'entity_id' => null, 'period' => $period, 'date' => $date],
                    ['metrics' => $metrics, 'created_at' => now()]
                );
            }
            $this->info('Platform analytics cached.');
        }

        if ($type === 'all' || $type === 'university') {
            $universities = University::all();
            $this->info("Caching analytics for {$universities->count()} universities...");

            foreach ($universities as $uni) {
                $metrics = $analyticsService->universityMetrics($uni->id, $from, $to);

                if (!$dryRun) {
                    AnalyticsSnapshot::updateOrCreate(
                        ['type' => 'university', 'entity_id' => $uni->id, 'period' => $period, 'date' => $date],
                        ['metrics' => $metrics, 'created_at' => now()]
                    );
                }
            }
            $this->info('University analytics cached.');
        }

        if ($type === 'all' || $type === 'site') {
            $sites = RotationSite::where('is_active', true)->get();
            $this->info("Caching analytics for {$sites->count()} sites...");

            foreach ($sites as $site) {
                $metrics = $analyticsService->siteMetrics($site->id, $from, $to);

                if (!$dryRun) {
                    AnalyticsSnapshot::updateOrCreate(
                        ['type' => 'site', 'entity_id' => $site->id, 'period' => $period, 'date' => $date],
                        ['metrics' => $metrics, 'created_at' => now()]
                    );
                }
            }
            $this->info('Site analytics cached.');
        }

        // Cleanup old snapshots (90 days daily, 24 months monthly)
        if (!$dryRun) {
            $dailyCutoff = now()->subDays(90);
            $monthlyCutoff = now()->subMonths(24);

            AnalyticsSnapshot::where('period', 'daily')
                ->where('date', '<', $dailyCutoff)
                ->delete();

            AnalyticsSnapshot::where('period', 'monthly')
                ->where('date', '<', $monthlyCutoff)
                ->delete();

            $this->info('Old snapshots cleaned up.');
        }

        $this->info('Done!');
        return Command::SUCCESS;
    }
}
