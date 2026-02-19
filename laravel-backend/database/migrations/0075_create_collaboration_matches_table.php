<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaboration_matches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('request_id');
            $table->uuid('physician_profile_id');
            $table->string('status')->default('pending'); // pending, accepted, declined
            $table->decimal('match_score', 5, 2);
            $table->json('match_reasons');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->foreign('request_id')->references('id')->on('collaboration_requests')->cascadeOnDelete();
            $table->foreign('physician_profile_id')->references('id')->on('physician_profiles')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaboration_matches');
    }
};
