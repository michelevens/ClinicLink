<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('certificates', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('student_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUuid('slot_id')->constrained('rotation_slots')->cascadeOnDelete();
            $table->foreignUuid('issued_by')->constrained('users')->cascadeOnDelete();
            $table->string('certificate_number')->unique();
            $table->string('title');
            $table->decimal('total_hours', 8, 1);
            $table->decimal('overall_score', 3, 1)->nullable();
            $table->string('status')->default('issued'); // issued, revoked
            $table->date('issued_date');
            $table->date('revoked_date')->nullable();
            $table->string('revocation_reason')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('certificates');
    }
};
