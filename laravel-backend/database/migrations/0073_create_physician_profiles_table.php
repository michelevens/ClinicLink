<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('physician_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('user_id')->unique();
            $table->json('licensed_states');
            $table->json('specialties');
            $table->integer('max_supervisees')->default(5);
            $table->string('supervision_model'); // in_person, telehealth, hybrid
            $table->boolean('malpractice_confirmed')->default(false);
            $table->string('malpractice_document_url')->nullable();
            $table->text('bio')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('physician_profiles');
    }
};
