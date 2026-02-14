<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('accreditation_reports', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('university_id')->constrained('universities')->cascadeOnDelete();
            $table->foreignUuid('generated_by')->constrained('users')->cascadeOnDelete();
            $table->string('report_type'); // annual_summary, program_review, site_evaluation, student_outcomes, clinical_hours
            $table->string('title');
            $table->json('parameters')->nullable(); // {date_from, date_to, program_id, site_id}
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->integer('file_size')->nullable();
            $table->string('status')->default('generating'); // generating, completed, failed
            $table->timestamp('generated_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('accreditation_reports');
    }
};
