<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preceptor_profiles', function (Blueprint $table) {
            $table->string('npi_number', 10)->nullable()->unique()->after('profile_visibility');
            $table->timestamp('npi_verified_at')->nullable()->after('npi_number');
            $table->json('npi_data')->nullable()->after('npi_verified_at');
        });

        Schema::table('rotation_sites', function (Blueprint $table) {
            $table->string('npi_number', 10)->nullable()->unique()->after('is_active');
            $table->timestamp('npi_verified_at')->nullable()->after('npi_number');
            $table->json('npi_data')->nullable()->after('npi_verified_at');
        });
    }

    public function down(): void
    {
        Schema::table('preceptor_profiles', function (Blueprint $table) {
            $table->dropColumn(['npi_number', 'npi_verified_at', 'npi_data']);
        });

        Schema::table('rotation_sites', function (Blueprint $table) {
            $table->dropColumn(['npi_number', 'npi_verified_at', 'npi_data']);
        });
    }
};
