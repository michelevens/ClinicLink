<?php

namespace App\Notifications;

use App\Models\SiteJoinRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SiteJoinRequestReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public SiteJoinRequest $joinRequest,
        public string $decision,
    ) {}

    public function via(object $notifiable): array
    {
        return $notifiable->wantsNotification('site_join_requests') ? ['database'] : [];
    }

    public function toArray(): array
    {
        $status = $this->decision === 'approved' ? 'Approved' : 'Denied';

        return [
            'title' => "Join Request {$status}",
            'message' => "Your request to join {$this->joinRequest->site->name} has been {$this->decision}.",
            'join_request_id' => $this->joinRequest->id,
            'link' => '/my-site',
        ];
    }
}
