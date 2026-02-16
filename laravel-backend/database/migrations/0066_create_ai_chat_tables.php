<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_chat_conversations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('context_page')->nullable();
            $table->integer('message_count')->default(0);
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'updated_at']);
        });

        Schema::create('ai_chat_messages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ai_chat_conversation_id')->constrained('ai_chat_conversations')->cascadeOnDelete();
            $table->string('role'); // 'user', 'assistant', 'system'
            $table->text('content');
            $table->integer('tokens_used')->nullable();
            $table->timestamps();

            $table->index(['ai_chat_conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_chat_messages');
        Schema::dropIfExists('ai_chat_conversations');
    }
};
