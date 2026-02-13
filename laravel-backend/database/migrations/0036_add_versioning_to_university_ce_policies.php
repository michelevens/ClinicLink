<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('university_ce_policies', function (Blueprint $table) {
            $table->unsignedInteger('version')->default(1)->after('signer_credentials');
            $table->date('effective_from')->nullable()->after('version');
            $table->date('effective_to')->nullable()->after('effective_from');
            $table->uuid('created_by')->nullable()->after('effective_to');
            $table->uuid('updated_by')->nullable()->after('created_by');

            $table->foreign('created_by')
                  ->references('id')->on('users')
                  ->nullOnDelete();
            $table->foreign('updated_by')
                  ->references('id')->on('users')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('university_ce_policies', function (Blueprint $table) {
            $table->dropForeign(['created_by']);
            $table->dropForeign(['updated_by']);
            $table->dropColumn(['version', 'effective_from', 'effective_to', 'created_by', 'updated_by']);
        });
    }
};
