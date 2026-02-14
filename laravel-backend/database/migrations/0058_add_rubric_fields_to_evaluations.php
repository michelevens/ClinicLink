<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->json('rating_scale')->nullable()->after('categories');
        });

        Schema::table('evaluations', function (Blueprint $table) {
            $table->foreignUuid('template_id')->nullable()->after('type')
                ->constrained('evaluation_templates')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('evaluations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('template_id');
        });

        Schema::table('evaluation_templates', function (Blueprint $table) {
            $table->dropColumn('rating_scale');
        });
    }
};
