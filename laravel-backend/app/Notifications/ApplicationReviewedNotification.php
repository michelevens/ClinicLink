<?php

namespace App\Notifications;

use App\Models\Application;
use App\Notifications\Channels\ExpoPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ApplicationReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(public Application $application, public string $status) {}

    public function via(): array
    {
        return ['database', ExpoPushChannel::class];
    }

    public function toArray(): array
    {
        $statusText = match ($this->status) {
            'accepted' => 'accepted',
            'declined' => 'declined',
            'waitlisted' => 'waitlisted',
            default => 'reviewed',
        };

        return [
            'title' => 'Application ' . ucfirst($statusText),
            'message' => "Your application for {$this->application->slot->title} has been {$statusText}.",
            'application_id' => $this->application->id,
            'status' => $this->status,
            'link' => '/applications',
        ];
    }

    public function toPush(object $notifiable): array
    {
        $data = $this->toArray();
        return [
            'title' => $data['title'],
            'body' => $data['message'],
            'data' => [
                'type' => 'application',
                'applicationId' => $this->application->id,
                'screen' => 'Applications',
            ],
        ];
    }
}
