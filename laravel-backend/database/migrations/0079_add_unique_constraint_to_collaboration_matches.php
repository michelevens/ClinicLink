<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collaboration_matches', function (Blueprint $table) {
            $table->unique(['request_id', 'physician_profile_id'], 'collab_matches_request_physician_unique');
        });
    }

    public function down(): void
    {
        Schema::table('collaboration_matches', function (Blueprint $table) {
            $table->dropUnique('collab_matches_request_physician_unique');
        });
    }
};
