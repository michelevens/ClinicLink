<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('physician_profiles', function (Blueprint $table) {
            $table->string('stripe_connect_account_id')->nullable()->after('bio');
            $table->string('stripe_connect_status')->nullable()->after('stripe_connect_account_id'); // onboarding, verified, restricted
            $table->timestamp('stripe_connect_onboarded_at')->nullable()->after('stripe_connect_status');
        });
    }

    public function down(): void
    {
        Schema::table('physician_profiles', function (Blueprint $table) {
            $table->dropColumn(['stripe_connect_account_id', 'stripe_connect_status', 'stripe_connect_onboarded_at']);
        });
    }
};
