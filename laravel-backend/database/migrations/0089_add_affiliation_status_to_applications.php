<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasColumn('applications', 'affiliation_status')) {
            Schema::table('applications', function (Blueprint $table) {
                $table->string('affiliation_status')->nullable()->after('status');
                // null = affiliated or N/A, 'pending' = awaiting affiliation, 'established' = affiliation now active
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('applications', 'affiliation_status')) {
            Schema::table('applications', function (Blueprint $table) {
                $table->dropColumn('affiliation_status');
            });
        }
    }
};
