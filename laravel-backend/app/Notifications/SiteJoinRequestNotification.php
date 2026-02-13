<?php

namespace App\Notifications;

use App\Models\SiteJoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SiteJoinRequestNotification extends Notification
{
    use Queueable;

    public function __construct(public SiteJoinRequest $joinRequest) {}

    public function via(object $notifiable): array
    {
        return $notifiable->wantsNotification('site_join_requests') ? ['database'] : [];
    }

    public function toArray(): array
    {
        return [
            'title' => 'New Join Request',
            'message' => "{$this->joinRequest->preceptor->full_name} requested to join {$this->joinRequest->site->name}.",
            'join_request_id' => $this->joinRequest->id,
            'link' => '/site-preceptors',
        ];
    }
}
