<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('oig_exclusions')) {
            Schema::create('oig_exclusions', function (Blueprint $table) {
                $table->id();
                $table->string('lastname', 20)->index();
                $table->string('firstname', 15)->nullable();
                $table->string('midname', 15)->nullable();
                $table->string('busname', 30)->nullable()->index();
                $table->string('general', 20)->nullable();
                $table->string('specialty', 20)->nullable();
                $table->string('upin', 6)->nullable();
                $table->string('npi', 10)->nullable()->index();
                $table->string('dob', 8)->nullable();
                $table->string('address', 30)->nullable();
                $table->string('city', 20)->nullable();
                $table->string('state', 2)->nullable();
                $table->string('zip', 5)->nullable();
                $table->string('excltype', 9)->nullable();
                $table->string('excldate', 8)->nullable();
                $table->string('reindate', 8)->nullable();
                $table->string('waiverdate', 8)->nullable();
                $table->string('waiverstate', 2)->nullable();
                $table->timestamps();
                $table->index(['lastname', 'firstname', 'state']);
            });
        }

        if (!Schema::hasTable('exclusion_screenings')) {
            Schema::create('exclusion_screenings', function (Blueprint $table) {
                $table->uuid('id')->primary();
                $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
                $table->foreignUuid('screened_by')->nullable()->constrained('users')->nullOnDelete();
                $table->string('source');
                $table->string('match_type')->nullable();
                $table->string('result');
                $table->json('match_details')->nullable();
                $table->text('notes')->nullable();
                $table->timestamps();
                $table->index(['user_id', 'source']);
                $table->index('created_at');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('exclusion_screenings');
        Schema::dropIfExists('oig_exclusions');
    }
};
