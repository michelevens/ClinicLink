<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // PostgreSQL: add 'completed' to the existing enum type
        DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check");
        DB::statement("ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'waitlisted', 'withdrawn', 'completed'))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check");
        DB::statement("ALTER TABLE applications ADD CONSTRAINT applications_status_check CHECK (status IN ('pending', 'accepted', 'declined', 'waitlisted', 'withdrawn'))");
    }
};
