<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('preceptor_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->json('specialties')->nullable(); // ["Family Medicine", "Pediatrics"]
            $table->integer('years_experience')->nullable();
            $table->text('bio')->nullable();
            $table->json('credentials')->nullable(); // [{type, name, issuer, year}]
            $table->string('availability_status')->default('available'); // available, limited, unavailable
            $table->integer('max_students')->default(2);
            $table->string('preferred_schedule')->nullable();
            $table->text('teaching_philosophy')->nullable();
            $table->json('badges')->nullable(); // ["mentor_bronze", "top_rated"]
            $table->integer('total_students_mentored')->default(0);
            $table->decimal('total_hours_supervised', 8, 2)->default(0);
            $table->string('profile_visibility')->default('public'); // public, university_only, private
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('preceptor_profiles');
    }
};
