<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('practitioner_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('profession_type');              // np, pa
            $table->json('licensed_states');
            $table->string('primary_specialty')->default('');
            $table->integer('years_in_practice')->default(0);
            $table->string('current_employer')->nullable();
            $table->string('npi_number')->nullable();
            $table->json('license_numbers')->nullable();    // [{state, number}]
            $table->string('license_document_url')->nullable();
            $table->string('malpractice_document_url')->nullable();
            $table->boolean('malpractice_confirmed')->default(false);
            $table->text('bio')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('practitioner_profiles');
    }
};
