<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ce_certificates', function (Blueprint $table) {
            $table->timestamp('revoked_at')->nullable()->after('rejection_reason');
            $table->uuid('revoked_by')->nullable()->after('revoked_at');
            $table->text('revocation_reason')->nullable()->after('revoked_by');
            $table->string('policy_version_id')->nullable()->after('revocation_reason');

            $table->foreign('revoked_by')
                  ->references('id')->on('users')
                  ->nullOnDelete();
        });

        // Add 'revoked' to the status enum
        DB::statement("ALTER TABLE ce_certificates DROP CONSTRAINT IF EXISTS ce_certificates_status_check");
        DB::statement("ALTER TABLE ce_certificates ADD CONSTRAINT ce_certificates_status_check CHECK (status IN ('pending', 'approved', 'issued', 'rejected', 'revoked'))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE ce_certificates DROP CONSTRAINT IF EXISTS ce_certificates_status_check");
        DB::statement("ALTER TABLE ce_certificates ADD CONSTRAINT ce_certificates_status_check CHECK (status IN ('pending', 'approved', 'issued', 'rejected'))");

        Schema::table('ce_certificates', function (Blueprint $table) {
            $table->dropForeign(['revoked_by']);
            $table->dropColumn(['revoked_at', 'revoked_by', 'revocation_reason', 'policy_version_id']);
        });
    }
};
