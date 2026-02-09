<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('university_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('program_id')->nullable()->constrained()->nullOnDelete();
            $table->date('graduation_date')->nullable();
            $table->decimal('gpa', 3, 2)->nullable();
            $table->json('clinical_interests')->nullable();
            $table->integer('hours_completed')->default(0);
            $table->integer('hours_required')->default(0);
            $table->text('bio')->nullable();
            $table->string('resume_url')->nullable();
            $table->timestamps();
        });

        Schema::create('credentials', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['cpr', 'background_check', 'immunization', 'liability_insurance', 'drug_screen', 'license', 'hipaa', 'other']);
            $table->string('name');
            $table->date('expiration_date')->nullable();
            $table->enum('status', ['valid', 'expiring_soon', 'expired', 'pending'])->default('pending');
            $table->string('document_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('credentials');
        Schema::dropIfExists('student_profiles');
    }
};
