<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('analytics_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type'); // platform, university, site
            $table->uuid('entity_id')->nullable(); // university_id or site_id, null for platform
            $table->string('period'); // daily, weekly, monthly
            $table->date('date');
            $table->json('metrics');
            $table->timestamp('created_at')->nullable();

            $table->index(['type', 'entity_id', 'date']);
            $table->index(['type', 'period', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_snapshots');
    }
};
