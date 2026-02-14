<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->string('payment_status')->nullable()->after('notes'); // null (free), pending, paid, refunded
            $table->foreignUuid('payment_id')->nullable()->constrained('payments')->nullOnDelete()->after('payment_status');
        });
    }

    public function down(): void
    {
        Schema::table('applications', function (Blueprint $table) {
            $table->dropForeign(['payment_id']);
            $table->dropColumn(['payment_status', 'payment_id']);
        });
    }
};
