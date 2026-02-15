<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Create preceptor_profiles for any preceptor user that doesn't have one
        $preceptorUsers = DB::table('users')
            ->where('role', 'preceptor')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('preceptor_profiles')
                    ->whereColumn('preceptor_profiles.user_id', 'users.id');
            })
            ->get();

        foreach ($preceptorUsers as $user) {
            DB::table('preceptor_profiles')->insert([
                'id' => (string) \Illuminate\Support\Str::uuid(),
                'user_id' => $user->id,
                'specialties' => json_encode([]),
                'badges' => json_encode([]),
                'credentials' => json_encode([]),
                'availability_status' => 'available',
                'max_students' => 5,
                'total_students_mentored' => 0,
                'total_hours_supervised' => 0,
                'profile_visibility' => 'public',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // No rollback needed
    }
};
