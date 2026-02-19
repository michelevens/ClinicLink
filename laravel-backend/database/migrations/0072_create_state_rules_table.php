<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('state_rules', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->char('state', 2)->unique();
            $table->string('practice_level'); // full, reduced, restricted
            $table->boolean('supervision_required');
            $table->integer('max_np_ratio')->nullable();
            $table->integer('chart_review_percent')->nullable();
            $table->boolean('telehealth_allowed');
            $table->date('last_updated');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('state_rules');
    }
};
