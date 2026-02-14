<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluation_reminders_sent', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('application_id')->constrained()->cascadeOnDelete();
            $table->string('evaluation_type'); // mid_rotation or final
            $table->string('reminder_window'); // 7_days_before or due_date
            $table->timestamp('sent_at');
            $table->timestamps();

            $table->unique(['application_id', 'evaluation_type', 'reminder_window'], 'eval_reminder_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluation_reminders_sent');
    }
};
