<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('university_ce_policies')) {
            return;
        }

        Schema::create('university_ce_policies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('university_id');
            $table->boolean('offers_ce')->default(false);
            $table->string('accrediting_body')->nullable();
            $table->decimal('contact_hours_per_rotation', 5, 2)->default(0);
            $table->decimal('max_hours_per_year', 5, 2)->nullable();
            $table->boolean('requires_final_evaluation')->default(true);
            $table->boolean('requires_midterm_evaluation')->default(false);
            $table->boolean('requires_minimum_hours')->default(false);
            $table->decimal('minimum_hours_required', 6, 2)->nullable();
            $table->boolean('approval_required')->default(true);
            $table->string('certificate_template_path')->nullable();
            $table->string('signer_name')->nullable();
            $table->string('signer_credentials')->nullable();
            $table->timestamps();

            $table->foreign('university_id')->references('id')->on('universities')->cascadeOnDelete();
            $table->unique('university_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('university_ce_policies');
    }
};
