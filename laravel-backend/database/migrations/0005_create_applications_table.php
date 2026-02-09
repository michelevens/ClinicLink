<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('slot_id')->constrained('rotation_slots')->cascadeOnDelete();
            $table->enum('status', ['pending', 'accepted', 'declined', 'waitlisted', 'withdrawn'])->default('pending');
            $table->text('cover_letter')->nullable();
            $table->timestamp('submitted_at');
            $table->timestamp('reviewed_at')->nullable();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['student_id', 'slot_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
