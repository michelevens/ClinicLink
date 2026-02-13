<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ce_evidence_snapshots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ce_certificate_id')->unique();
            $table->json('policy_snapshot');
            $table->json('eligibility_snapshot');
            $table->json('evaluation_snapshot');
            $table->json('hour_logs_snapshot');
            $table->json('preceptor_credentials_snapshot');
            $table->json('rotation_snapshot');
            $table->timestamp('created_at');

            $table->foreign('ce_certificate_id')
                  ->references('id')->on('ce_certificates')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ce_evidence_snapshots');
    }
};
