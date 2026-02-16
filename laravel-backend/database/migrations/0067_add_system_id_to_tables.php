<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Add system_id to users
        Schema::table('users', function (Blueprint $table) {
            $table->string('system_id', 7)->nullable()->unique()->after('id');
        });

        // Add system_id to universities
        Schema::table('universities', function (Blueprint $table) {
            $table->string('system_id', 7)->nullable()->unique()->after('id');
        });

        // Add system_id to rotation_sites
        Schema::table('rotation_sites', function (Blueprint $table) {
            $table->string('system_id', 7)->nullable()->unique()->after('id');
        });

        // Backfill existing records with unique 7-char hex IDs
        $this->backfillTable('users');
        $this->backfillTable('universities');
        $this->backfillTable('rotation_sites');
    }

    private function backfillTable(string $table): void
    {
        $records = DB::table($table)->whereNull('system_id')->pluck('id');
        $existing = [];

        foreach ($records as $id) {
            do {
                $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 7));
            } while (in_array($code, $existing) || DB::table($table)->where('system_id', $code)->exists());

            $existing[] = $code;
            DB::table($table)->where('id', $id)->update(['system_id' => $code]);
        }
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('system_id');
        });
        Schema::table('universities', function (Blueprint $table) {
            $table->dropColumn('system_id');
        });
        Schema::table('rotation_sites', function (Blueprint $table) {
            $table->dropColumn('system_id');
        });
    }
};
