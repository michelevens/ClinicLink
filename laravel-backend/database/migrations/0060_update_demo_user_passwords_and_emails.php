<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    /**
     * Update demo user passwords to ClinicLink2026! and align emails to @cliniclink.health
     */
    public function up(): void
    {
        $newPassword = Hash::make('ClinicLink2026!');

        // Update emails from @cliniclink.com to @cliniclink.health (if they exist with old domain)
        $emailMigrations = [
            'student@cliniclink.com' => 'student@cliniclink.health',
            'preceptor@cliniclink.com' => 'preceptor@cliniclink.health',
            'site@cliniclink.com' => 'site@cliniclink.health',
            'coordinator@cliniclink.com' => 'coordinator@cliniclink.health',
            'professor@cliniclink.com' => 'professor@cliniclink.health',
            'admin@cliniclink.com' => 'admin@cliniclink.health',
        ];

        foreach ($emailMigrations as $oldEmail => $newEmail) {
            DB::table('users')->where('email', $oldEmail)->update([
                'email' => $newEmail,
                'password' => $newPassword,
            ]);
        }

        // Also update password for users already on @cliniclink.health domain
        $healthEmails = [
            'student@cliniclink.health',
            'preceptor@cliniclink.health',
            'site@cliniclink.health',
            'coordinator@cliniclink.health',
            'professor@cliniclink.health',
            'admin@cliniclink.health',
        ];

        DB::table('users')->whereIn('email', $healthEmails)->update([
            'password' => $newPassword,
        ]);
    }

    /**
     * Revert to old password (not recommended)
     */
    public function down(): void
    {
        $oldPassword = Hash::make('password');

        $emails = [
            'student@cliniclink.health',
            'preceptor@cliniclink.health',
            'site@cliniclink.health',
            'coordinator@cliniclink.health',
            'professor@cliniclink.health',
            'admin@cliniclink.health',
        ];

        DB::table('users')->whereIn('email', $emails)->update([
            'password' => $oldPassword,
        ]);
    }
};
