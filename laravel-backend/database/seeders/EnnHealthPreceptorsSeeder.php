<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\PreceptorProfile;
use App\Models\PhysicianProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class EnnHealthPreceptorsSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('ClinicLink2026!');

        // 1. MD Preceptor - HAS Collaborate access
        $mdPreceptor = User::create([
            'first_name' => 'James',
            'last_name' => 'Wilson',
            'email' => 'contact+md-preceptor@ennhealth.com',
            'username' => 'mdpreceptor',
            'password' => $password,
            'role' => 'preceptor',
            'phone' => '(407) 555-0201',
            'is_active' => true,
            'email_verified' => true,
            'onboarding_completed_at' => now(),
        ]);

        PreceptorProfile::create([
            'user_id' => $mdPreceptor->id,
            'specialties' => ['Emergency Medicine', 'Family Medicine'],
            'years_experience' => 15,
            'bio' => 'Board-certified physician available for clinical supervision and collaborative practice agreements.',
            'availability_status' => 'available',
            'max_students' => 4,
            'profile_visibility' => 'public',
            'npi_number' => '1234567890',
            'npi_verified_at' => now(),
            'npi_data' => [
                'taxonomies' => [
                    ['code' => '207P00000X', 'desc' => 'Emergency Medicine', 'primary' => true],
                ],
            ],
        ]);

        PhysicianProfile::create([
            'user_id' => $mdPreceptor->id,
            'licensed_states' => ['FL', 'GA', 'AL'],
            'specialties' => ['Emergency Medicine', 'Family Medicine'],
            'max_supervisees' => 3,
            'supervision_model' => 'hybrid',
            'malpractice_confirmed' => true,
            'bio' => 'Available for collaborative practice agreements with NPs and PAs.',
            'is_active' => true,
        ]);

        // 2. NP Preceptor - NO Collaborate access
        $npPreceptor = User::create([
            'first_name' => 'Amanda',
            'last_name' => 'Rodriguez',
            'email' => 'contact+np-preceptor@ennhealth.com',
            'username' => 'nppreceptor',
            'password' => $password,
            'role' => 'preceptor',
            'phone' => '(407) 555-0202',
            'is_active' => true,
            'email_verified' => true,
            'onboarding_completed_at' => now(),
        ]);

        PreceptorProfile::create([
            'user_id' => $npPreceptor->id,
            'specialties' => ['Family Practice', 'Pediatrics'],
            'years_experience' => 8,
            'bio' => 'Nurse Practitioner with experience in family practice.',
            'availability_status' => 'available',
            'max_students' => 2,
            'profile_visibility' => 'public',
            'npi_number' => '9876543210',
            'npi_verified_at' => now(),
            'npi_data' => [
                'taxonomies' => [
                    ['code' => '363LF0000X', 'desc' => 'Nurse Practitioner, Family', 'primary' => true],
                ],
            ],
        ]);

        $this->command->info('✅ Created 2 EnnHealth preceptor accounts:');
        $this->command->info('   1. contact+md-preceptor@ennhealth.com (Physician - HAS Collaborate)');
        $this->command->info('   2. contact+np-preceptor@ennhealth.com (NP - NO Collaborate)');
        $this->command->info('   Password: ClinicLink2026!');
    }
}
