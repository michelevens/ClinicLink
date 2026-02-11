<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('affiliation_agreements')) {
            return;
        }

        Schema::create('affiliation_agreements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('university_id');
            $table->uuid('site_id');
            $table->enum('status', ['draft', 'pending_review', 'active', 'expired', 'terminated'])->default('draft');
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->string('document_url')->nullable();
            $table->string('file_path')->nullable();
            $table->string('file_name')->nullable();
            $table->integer('file_size')->nullable();
            $table->text('notes')->nullable();
            $table->uuid('created_by')->nullable();
            $table->timestamps();

            $table->foreign('university_id')->references('id')->on('universities')->cascadeOnDelete();
            $table->foreign('site_id')->references('id')->on('rotation_sites')->cascadeOnDelete();
            $table->foreign('created_by')->references('id')->on('users')->nullOnDelete();
            $table->index(['university_id', 'site_id']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliation_agreements');
    }
};
