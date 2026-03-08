<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_settings', function (Blueprint $table) {
            $table->string('key')->primary();
            $table->text('value')->nullable();
            $table->string('type')->default('string'); // string, boolean, json, integer
            $table->string('group')->default('general'); // general, notifications, compliance, etc.
            $table->string('label')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        // Seed default notification settings
        $now = now();
        DB::table('app_settings')->insert([
            [
                'key' => 'admin_notification_email',
                'value' => 'michelevens@gmail.com',
                'type' => 'string',
                'group' => 'notifications',
                'label' => 'Admin Notification Email',
                'description' => 'Email address that receives notifications for new user registrations and important platform events. If empty, notifications go to all active admin accounts.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'notify_admin_on_registration',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'notifications',
                'label' => 'Notify on New Registration',
                'description' => 'Send an email notification when a new user registers.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'notify_admin_on_support_request',
                'value' => 'true',
                'type' => 'boolean',
                'group' => 'notifications',
                'label' => 'Notify on Support Request',
                'description' => 'Send an email notification when a user submits a support request.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'key' => 'platform_name',
                'value' => 'ClinicLink',
                'type' => 'string',
                'group' => 'general',
                'label' => 'Platform Name',
                'description' => 'The name of the platform shown in emails and UI.',
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('app_settings');
    }
};
