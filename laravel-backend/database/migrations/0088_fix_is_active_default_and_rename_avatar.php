<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Fix is_active default: should be false (require admin approval)
        // The old default(true) was dangerous — any user created outside
        // the register controller would bypass approval
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_active')->default(false)->change();
        });

        // Fix avatar column name: code uses avatar_url but column is avatar
        if (Schema::hasColumn('users', 'avatar') && !Schema::hasColumn('users', 'avatar_url')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('avatar', 'avatar_url');
            });
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->change();
        });

        if (Schema::hasColumn('users', 'avatar_url') && !Schema::hasColumn('users', 'avatar')) {
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('avatar_url', 'avatar');
            });
        }
    }
};
