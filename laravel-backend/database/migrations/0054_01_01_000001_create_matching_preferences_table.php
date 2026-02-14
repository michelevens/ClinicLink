<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('matching_preferences', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->json('preferred_specialties')->nullable();
            $table->json('preferred_states')->nullable();
            $table->json('preferred_cities')->nullable();
            $table->integer('max_distance_miles')->nullable();
            $table->string('preferred_schedule')->nullable();
            $table->string('cost_preference')->default('any'); // any, free_only, paid_ok
            $table->decimal('min_preceptor_rating', 2, 1)->nullable();
            $table->date('preferred_start_after')->nullable();
            $table->date('preferred_start_before')->nullable();
            $table->boolean('exclude_applied')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('matching_preferences');
    }
};
