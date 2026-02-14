<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preceptor_reviews', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('preceptor_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('slot_id')->constrained('rotation_slots')->cascadeOnDelete();
            $table->json('ratings'); // {teaching_quality: 4, communication: 5, ...}
            $table->text('comments')->nullable();
            $table->decimal('overall_score', 2, 1);
            $table->boolean('is_anonymous')->default(false);
            $table->timestamps();

            $table->unique(['student_id', 'preceptor_id', 'slot_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preceptor_reviews');
    }
};
