<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();

            // Owner — the user this document belongs to
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();

            // Polymorphic link — nullable because some documents are standalone uploads
            // Supported morphable types: Credential, OnboardingTask, AffiliationAgreement,
            // SupervisionAgreement, CeCertificate, etc.
            $table->nullableUuidMorphs('documentable');

            // Virtual folder for UI grouping — not a hard business rule, easily changed by the user
            $table->string('folder')->default('general');
            // Expected values: 'credentials', 'onboarding', 'agreements', 'general', 'other'

            // Display metadata
            $table->string('title');
            $table->text('description')->nullable();

            // Storage
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size'); // bytes
            $table->string('mime_type');

            // Expiry tracking (mirrors Credential pattern)
            $table->date('expiration_date')->nullable();

            // Lifecycle status
            $table->enum('status', ['active', 'expired', 'archived'])->default('active');

            // Uploader — may differ from owner (e.g., a coordinator uploading on behalf of a student)
            $table->foreignUuid('uploaded_by')->nullable()->constrained('users')->nullOnDelete();

            // Access control
            $table->enum('visibility', ['private', 'shared', 'public'])->default('private');
            $table->json('shared_with')->nullable(); // array of user UUIDs

            // Flexible extra data (source system ref, tags, version notes, etc.)
            $table->json('metadata')->nullable();

            $table->timestamps();
            $table->softDeletes();

            // Indexes for the most common query patterns
            $table->index(['user_id', 'folder']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'expiration_date']);
            $table->index(['documentable_type', 'documentable_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
