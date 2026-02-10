<?php

/**
 * One-time university seeder script.
 * Hit this URL directly: /seed-universities.php?key=cliniclink-seed-2026
 * Delete this file after use.
 */

if (($_GET['key'] ?? '') !== 'cliniclink-seed-2026') {
    http_response_code(403);
    echo json_encode(['error' => 'Invalid key']);
    exit;
}

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

header('Content-Type: application/json');

$exitCode = Illuminate\Support\Facades\Artisan::call('scrape:universities', [
    '--source' => 'curated',
    '--with-programs' => true,
]);

$output = Illuminate\Support\Facades\Artisan::output();

echo json_encode([
    'message' => 'University seeding complete.',
    'exit_code' => $exitCode,
    'output' => $output,
], JSON_PRETTY_PRINT);
