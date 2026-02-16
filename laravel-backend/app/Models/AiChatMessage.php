<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AiChatMessage extends Model
{
    use HasUuids;

    protected $fillable = [
        'ai_chat_conversation_id',
        'role',
        'content',
        'tokens_used',
    ];

    protected function casts(): array
    {
        return [
            'tokens_used' => 'integer',
        ];
    }

    public function conversation()
    {
        return $this->belongsTo(AiChatConversation::class, 'ai_chat_conversation_id');
    }
}
