<?php

namespace App\Console\Commands;

use App\Services\OigScreeningService;
use Illuminate\Console\Command;

class ImportOigExclusions extends Command
{
    protected $signature = 'oig:import {--screen-all : Also screen all active preceptors/users after import}';

    protected $description = 'Download and import the OIG LEIE exclusion database CSV';

    public function handle(OigScreeningService $service): int
    {
        $this->info('Downloading OIG LEIE database...');

        try {
            $count = $service->importLeieDatabase();
            $this->info("Successfully imported {$count} exclusion records.");
        } catch (\Exception $e) {
            $this->error("Import failed: {$e->getMessage()}");
            return self::FAILURE;
        }

        if ($this->option('screen-all')) {
            $this->info('Screening all active preceptors...');

            $users = \App\Models\User::where('is_active', true)
                ->whereIn('role', ['preceptor', 'practitioner'])
                ->get();

            $results = $service->screenUsers($users);
            $matches = collect($results)->where('result', 'match_found')->count();
            $clear = collect($results)->where('result', 'clear')->count();
            $errors = collect($results)->where('result', 'error')->count();

            $this->info("Screening complete: {$clear} clear, {$matches} matches found, {$errors} errors");

            if ($matches > 0) {
                $this->warn("⚠ {$matches} potential exclusion matches found! Review in the admin dashboard.");
            }
        }

        return self::SUCCESS;
    }
}
