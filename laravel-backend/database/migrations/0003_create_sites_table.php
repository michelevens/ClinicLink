<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('rotation_sites', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('address');
            $table->string('city');
            $table->string('state', 2);
            $table->string('zip', 10);
            $table->string('phone');
            $table->string('website')->nullable();
            $table->text('description')->nullable();
            $table->json('specialties')->nullable();
            $table->string('ehr_system')->nullable();
            $table->json('photos')->nullable();
            $table->foreignUuid('manager_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('rating', 2, 1)->default(0);
            $table->integer('review_count')->default(0);
            $table->boolean('is_verified')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('rotation_slots', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('site_id')->constrained('rotation_sites')->cascadeOnDelete();
            $table->string('specialty');
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('start_date');
            $table->date('end_date');
            $table->integer('capacity');
            $table->integer('filled')->default(0);
            $table->json('requirements')->nullable();
            $table->decimal('cost', 8, 2)->default(0);
            $table->enum('cost_type', ['free', 'paid'])->default('free');
            $table->enum('status', ['open', 'filled', 'closed'])->default('open');
            $table->foreignUuid('preceptor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('shift_schedule')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('rotation_slots');
        Schema::dropIfExists('rotation_sites');
    }
};
