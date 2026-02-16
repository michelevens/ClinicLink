<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_invites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('university_id');
            $table->uuid('program_id')->nullable();
            $table->uuid('invited_by');
            $table->string('token', 64)->unique();
            $table->string('email')->nullable();
            $table->string('status', 20)->default('pending'); // pending, accepted, revoked
            $table->uuid('accepted_by')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->foreign('university_id')->references('id')->on('universities')->cascadeOnDelete();
            $table->foreign('program_id')->references('id')->on('programs')->nullOnDelete();
            $table->foreign('invited_by')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('accepted_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_invites');
    }
};
