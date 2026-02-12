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

    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};
