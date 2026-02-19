<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('collaboration_requests', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id');
            $table->string('profession_type'); // np, pa
            $table->json('states_requested');
            $table->string('specialty');
            $table->string('practice_model'); // telehealth, in_person, hybrid
            $table->date('expected_start_date');
            $table->string('preferred_supervision_model')->nullable();
            $table->string('status')->default('open'); // open, matched, closed
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('collaboration_requests');
    }
};
