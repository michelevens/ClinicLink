<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->enum('type', ['mid_rotation', 'final', 'student_feedback']);
            $table->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('preceptor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('slot_id')->constrained('rotation_slots')->cascadeOnDelete();
            $table->json('ratings');
            $table->text('comments')->nullable();
            $table->decimal('overall_score', 3, 1);
            $table->text('strengths')->nullable();
            $table->text('areas_for_improvement')->nullable();
            $table->boolean('is_submitted')->default(false);
            $table->timestamps();
        });

        Schema::create('affiliation_agreements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('university_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('site_id')->constrained('rotation_sites')->cascadeOnDelete();
            $table->enum('status', ['draft', 'pending_review', 'active', 'expired', 'terminated'])->default('draft');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('document_url')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['university_id', 'site_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliation_agreements');
        Schema::dropIfExists('evaluations');
    }
};
