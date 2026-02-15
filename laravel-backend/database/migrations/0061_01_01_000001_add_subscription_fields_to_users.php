<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('plan')->default('free'); // free, pro, enterprise
            $table->timestamp('trial_ends_at')->nullable(); // 3 months from registration
            $table->integer('free_rotations_used')->default(0); // count of applications with status != rejected
            $table->string('stripe_customer_id')->nullable(); // for subscription billing
            $table->string('stripe_subscription_id')->nullable();
            $table->string('subscription_status')->nullable(); // active, past_due, canceled, trialing
            $table->timestamp('subscription_ends_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'plan',
                'trial_ends_at',
                'free_rotations_used',
                'stripe_customer_id',
                'stripe_subscription_id',
                'subscription_status',
                'subscription_ends_at',
            ]);
        });
    }
};
