<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $password = Hash::make('ClinicLink2026!');
        $now = now();

        $users = [];

        // 20 Students
        for ($i = 1; $i <= 20; $i++) {
            $users[] = [
                'id' => Str::uuid()->toString(),
                'first_name' => "Student",
                'last_name' => "Test{$i}",
                'email' => "contact+student{$i}-school1@ennhealth.com",
                'password' => $password,
                'role' => 'student',
                'is_active' => false,
                'is_demo' => false,
                'email_verified' => false,
                'created_at' => $now->copy()->subMinutes(rand(1, 120)),
                'updated_at' => $now,
            ];
        }

        // 10 Preceptors
        for ($i = 1; $i <= 10; $i++) {
            $users[] = [
                'id' => Str::uuid()->toString(),
                'first_name' => "Preceptor",
                'last_name' => "Test{$i}",
                'email' => "contact+preceptor{$i}@ennhealth.com",
                'password' => $password,
                'role' => 'preceptor',
                'is_active' => false,
                'is_demo' => false,
                'email_verified' => false,
                'created_at' => $now->copy()->subMinutes(rand(1, 120)),
                'updated_at' => $now,
            ];
        }

        // 5 Site Managers
        for ($i = 1; $i <= 5; $i++) {
            $users[] = [
                'id' => Str::uuid()->toString(),
                'first_name' => "SiteManager",
                'last_name' => "Test{$i}",
                'email' => "contact+sitemanager{$i}@ennhealth.com",
                'password' => $password,
                'role' => 'site_manager',
                'is_active' => false,
                'is_demo' => false,
                'email_verified' => false,
                'created_at' => $now->copy()->subMinutes(rand(1, 120)),
                'updated_at' => $now,
            ];
        }

        // 5 Coordinators
        for ($i = 1; $i <= 5; $i++) {
            $users[] = [
                'id' => Str::uuid()->toString(),
                'first_name' => "Coordinator",
                'last_name' => "Test{$i}",
                'email' => "contact+coordinator{$i}@ennhealth.com",
                'password' => $password,
                'role' => 'coordinator',
                'is_active' => false,
                'is_demo' => false,
                'email_verified' => false,
                'created_at' => $now->copy()->subMinutes(rand(1, 120)),
                'updated_at' => $now,
            ];
        }

        // 5 Professors
        for ($i = 1; $i <= 5; $i++) {
            $users[] = [
                'id' => Str::uuid()->toString(),
                'first_name' => "Professor",
                'last_name' => "Test{$i}",
                'email' => "contact+professor{$i}@ennhealth.com",
                'password' => $password,
                'role' => 'professor',
                'is_active' => false,
                'is_demo' => false,
                'email_verified' => false,
                'created_at' => $now->copy()->subMinutes(rand(1, 120)),
                'updated_at' => $now,
            ];
        }

        // 5 Practitioners
        for ($i = 1; $i <= 5; $i++) {
            $users[] = [
                'id' => Str::uuid()->toString(),
                'first_name' => "Practitioner",
                'last_name' => "Test{$i}",
                'email' => "contact+practitioner{$i}@ennhealth.com",
                'password' => $password,
                'role' => 'practitioner',
                'is_active' => false,
                'is_demo' => false,
                'email_verified' => false,
                'created_at' => $now->copy()->subMinutes(rand(1, 120)),
                'updated_at' => $now,
            ];
        }

        // Insert in batches, skip any that already exist
        foreach ($users as $user) {
            $exists = DB::table('users')->where('email', $user['email'])->exists();
            if (!$exists) {
                DB::table('users')->insert($user);
            }
        }
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'like', 'contact+%@ennhealth.com')->delete();
    }
};
