<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('signatures', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuidMorphs('signable'); // signable_type + signable_id
            $table->string('signer_role'); // e.g. 'university', 'site', 'student'
            $table->string('signer_name');
            $table->string('signer_email');
            $table->foreignUuid('signer_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUuid('requested_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['requested', 'signed', 'rejected', 'cancelled'])->default('requested');
            $table->longText('signature_data')->nullable(); // base64 PNG/SVG from canvas
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->text('request_message')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->timestamp('requested_at')->nullable();
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('rejected_at')->nullable();
            $table->timestamps();

            $table->index(['signable_type', 'signable_id', 'status']);
            $table->index('signer_email');
        });

        // Add signature summary to agreements for quick querying
        Schema::table('affiliation_agreements', function (Blueprint $table) {
            $table->enum('signature_status', ['none', 'pending', 'partially_signed', 'fully_signed'])
                ->default('none')->after('status');
        });
    }

    public function down(): void
    {
        Schema::table('affiliation_agreements', function (Blueprint $table) {
            $table->dropColumn('signature_status');
        });

        Schema::dropIfExists('signatures');
    }
};
