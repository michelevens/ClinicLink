<?php

namespace App\Notifications;

use App\Models\RotationSite;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PreceptorAssignedToSiteNotification extends Notification
{
    use Queueable;

    public function __construct(public RotationSite $site) {}

    public function via(object $notifiable): array
    {
        return $notifiable->wantsNotification('site_join_requests') ? ['database'] : [];
    }

    public function toArray(): array
    {
        return [
            'title' => 'Assigned to Clinical Site',
            'message' => "You have been assigned to {$this->site->name} as a preceptor.",
            'site_id' => $this->site->id,
            'link' => '/my-site',
        ];
    }
}
