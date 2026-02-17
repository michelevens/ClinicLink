<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('sso_provider')->nullable();
            $table->string('sso_id')->nullable();
            $table->uuid('sso_university_id')->nullable();

            $table->foreign('sso_university_id')->references('id')->on('universities')->nullOnDelete();
            $table->index(['sso_provider', 'sso_id', 'sso_university_id'], 'users_sso_lookup_index');
        });

        // Make password nullable for SSO users
        Schema::table('users', function (Blueprint $table) {
            $table->string('password')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('users_sso_lookup_index');
            $table->dropForeign(['sso_university_id']);
            $table->dropColumn(['sso_provider', 'sso_id', 'sso_university_id']);
        });
    }
};
