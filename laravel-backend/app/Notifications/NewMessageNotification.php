<?php

namespace App\Notifications;

use App\Models\Message;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewMessageNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Message $message,
        public User $sender,
    ) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toArray(): array
    {
        return [
            'title' => "New message from {$this->sender->full_name}",
            'message' => \Illuminate\Support\Str::limit($this->message->body, 80),
            'conversation_id' => $this->message->conversation_id,
            'link' => "/messages/{$this->message->conversation_id}",
        ];
    }
}
