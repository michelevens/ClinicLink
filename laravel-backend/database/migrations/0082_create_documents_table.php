<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Table already exists in production — skip entirely
        if (Schema::hasTable('documents')) {
            return;
        }

        Schema::create('documents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->nullableUuidMorphs('documentable');
            $table->string('folder')->default('general');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_path');
            $table->string('file_name');
            $table->integer('file_size');
            $table->string('mime_type');
            $table->date('expiration_date')->nullable();
            $table->enum('status', ['active', 'expired', 'archived'])->default('active');
            $table->foreignUuid('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('visibility', ['private', 'shared', 'public'])->default('private');
            $table->json('shared_with')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();
            $table->index(['user_id', 'folder']);
            $table->index(['user_id', 'status']);
            $table->index(['user_id', 'expiration_date']);
            // nullableUuidMorphs already creates this index, so don't duplicate it
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
