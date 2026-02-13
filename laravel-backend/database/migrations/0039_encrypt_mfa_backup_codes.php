<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $users = DB::table('users')->whereNotNull('mfa_backup_codes')->get(['id', 'mfa_backup_codes']);

        foreach ($users as $user) {
            // Skip if already encrypted (Laravel encryption starts with 'eyJ' base64 prefix)
            if (str_starts_with($user->mfa_backup_codes, 'eyJ')) {
                continue;
            }

            DB::table('users')->where('id', $user->id)->update([
                'mfa_backup_codes' => Crypt::encryptString($user->mfa_backup_codes),
            ]);
        }
    }

    public function down(): void
    {
        // Irreversible — encrypted data cannot be converted back without knowing original format
    }
};
