<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $existing = DB::table('users')->where('email', 'practitioner@cliniclink.health')->first();

        if ($existing) {
            DB::table('users')->where('id', $existing->id)->update([
                'password' => Hash::make('ClinicLink2026!'),
                'email_verified' => true,
                'is_active' => true,
            ]);

            // Ensure practitioner profile exists
            $hasProfile = DB::table('practitioner_profiles')->where('user_id', $existing->id)->exists();
            if (!$hasProfile) {
                DB::table('practitioner_profiles')->insert([
                    'id' => Str::uuid()->toString(),
                    'user_id' => $existing->id,
                    'profession_type' => 'np',
                    'licensed_states' => json_encode(['FL', 'NY']),
                    'specialties' => json_encode([]),
                    'primary_specialty' => 'Family Practice',
                    'years_in_practice' => 5,
                    'current_employer' => 'Memorial Healthcare',
                    'malpractice_confirmed' => true,
                    'bio' => 'Experienced NP seeking collaborative practice agreement for independent practice in Florida.',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        } else {
            $userId = Str::uuid()->toString();
            DB::table('users')->insert([
                'id' => $userId,
                'first_name' => 'Emily',
                'last_name' => 'Reyes',
                'email' => 'practitioner@cliniclink.health',
                'username' => 'emilyreyes',
                'password' => Hash::make('ClinicLink2026!'),
                'role' => 'practitioner',
                'phone' => '(407) 555-0107',
                'is_active' => true,
                'email_verified' => true,
                'onboarding_completed_at' => now(),
                'system_id' => strtoupper(substr(md5(Str::uuid()->toString()), 0, 7)),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('practitioner_profiles')->insert([
                'id' => Str::uuid()->toString(),
                'user_id' => $userId,
                'profession_type' => 'np',
                'licensed_states' => json_encode(['FL', 'NY']),
                'specialties' => json_encode([]),
                'primary_specialty' => 'Family Practice',
                'years_in_practice' => 5,
                'current_employer' => 'Memorial Healthcare',
                'malpractice_confirmed' => true,
                'bio' => 'Experienced NP seeking collaborative practice agreement for independent practice in Florida.',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        $user = DB::table('users')->where('email', 'practitioner@cliniclink.health')->first();
        if ($user) {
            DB::table('practitioner_profiles')->where('user_id', $user->id)->delete();
            DB::table('users')->where('id', $user->id)->delete();
        }
    }
};
