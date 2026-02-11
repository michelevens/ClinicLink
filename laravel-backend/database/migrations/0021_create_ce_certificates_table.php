<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('ce_certificates')) {
            return;
        }

        Schema::create('ce_certificates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('university_id');
            $table->uuid('preceptor_id');
            $table->uuid('application_id');
            $table->decimal('contact_hours', 5, 2);
            $table->enum('status', ['pending', 'approved', 'issued', 'rejected'])->default('pending');
            $table->timestamp('issued_at')->nullable();
            $table->uuid('approved_by')->nullable();
            $table->string('certificate_path')->nullable();
            $table->uuid('verification_uuid')->unique();
            $table->text('rejection_reason')->nullable();
            $table->timestamps();

            $table->foreign('university_id')->references('id')->on('universities')->cascadeOnDelete();
            $table->foreign('preceptor_id')->references('id')->on('users')->cascadeOnDelete();
            $table->foreign('application_id')->references('id')->on('applications')->cascadeOnDelete();
            $table->foreign('approved_by')->references('id')->on('users')->nullOnDelete();

            $table->unique(['application_id'], 'ce_certificates_application_unique');
            $table->index(['preceptor_id', 'status']);
            $table->index(['university_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ce_certificates');
    }
};
