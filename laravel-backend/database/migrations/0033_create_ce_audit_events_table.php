<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ce_audit_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('ce_certificate_id');
            $table->string('event_type', 50);
            $table->uuid('actor_id')->nullable();
            $table->string('actor_role', 30);
            $table->json('metadata')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent', 500)->nullable();
            $table->timestamp('created_at');

            $table->foreign('ce_certificate_id')
                  ->references('id')->on('ce_certificates')
                  ->cascadeOnDelete();
            $table->foreign('actor_id')
                  ->references('id')->on('users')
                  ->nullOnDelete();

            $table->index(['ce_certificate_id', 'created_at']);
            $table->index(['event_type', 'created_at']);
            $table->index('actor_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ce_audit_events');
    }
};
