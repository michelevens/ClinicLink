<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->integer('prior_hours')->default(0)->after('hours_completed');
        });

        // Copy hours_required data into programs where missing, then drop the column
        // (hours_required now derived from programs.required_hours via relationship)
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn('hours_required');
        });
    }

    public function down(): void
    {
        Schema::table('student_profiles', function (Blueprint $table) {
            $table->integer('hours_required')->default(0)->after('hours_completed');
        });

        Schema::table('student_profiles', function (Blueprint $table) {
            $table->dropColumn('prior_hours');
        });
    }
};
