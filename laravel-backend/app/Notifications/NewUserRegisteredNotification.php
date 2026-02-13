<?php

namespace App\Notifications;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewUserRegisteredNotification extends Notification
{
    use Queueable;

    public function __construct(public User $newUser) {}

    public function via(object $notifiable): array
    {
        return $notifiable->wantsNotification('application_updates') ? ['database'] : [];
    }

    public function toArray(): array
    {
        return [
            'title' => 'New User Registered',
            'message' => "{$this->newUser->full_name} ({$this->newUser->role}) registered and is pending approval.",
            'user_id' => $this->newUser->id,
            'link' => '/admin/users/' . $this->newUser->id,
        ];
    }
}
