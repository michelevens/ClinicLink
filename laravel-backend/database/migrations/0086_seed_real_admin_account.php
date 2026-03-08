<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $existing = DB::table('users')->where('email', 'michelevens@gmail.com')->first();

        if ($existing) {
            DB::table('users')->where('id', $existing->id)->update([
                'role' => 'admin',
                'is_active' => true,
                'is_demo' => false,
                'email_verified' => true,
                'email_verified_at' => now(),
            ]);
        } else {
            DB::table('users')->insert([
                'id' => Str::uuid()->toString(),
                'first_name' => 'Michel',
                'last_name' => 'Evens',
                'email' => 'michelevens@gmail.com',
                'password' => Hash::make('ClinicLink2026!'),
                'role' => 'admin',
                'is_active' => true,
                'is_demo' => false,
                'email_verified' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('users')->where('email', 'michelevens@gmail.com')->delete();
    }
};
