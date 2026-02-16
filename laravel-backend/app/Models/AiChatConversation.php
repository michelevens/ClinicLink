<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class AiChatConversation extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id',
        'title',
        'context_page',
        'message_count',
        'last_message_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'message_count' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function messages()
    {
        return $this->hasMany(AiChatMessage::class);
    }
}
