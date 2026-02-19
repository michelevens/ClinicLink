<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('supervision_agreements', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('collaboration_match_id');
            $table->string('status')->default('draft'); // draft, pending_signature, active, paused, terminated
            $table->integer('monthly_fee_cents');
            $table->decimal('platform_fee_percent', 5, 2)->default(15.00);
            $table->integer('platform_fee_cents');
            $table->integer('billing_anchor')->nullable(); // 1-28, day of month
            $table->string('stripe_subscription_id')->nullable();
            $table->string('stripe_customer_id')->nullable();
            $table->string('stripe_connected_account_id')->nullable();
            $table->string('last_payment_status')->nullable(); // paid, failed, pending
            $table->timestamp('signed_at')->nullable();
            $table->timestamp('activated_at')->nullable();
            $table->timestamp('paused_at')->nullable();
            $table->timestamp('terminated_at')->nullable();
            $table->text('termination_reason')->nullable();
            $table->timestamps();

            $table->foreign('collaboration_match_id')->references('id')->on('collaboration_matches')->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('supervision_agreements');
    }
};
