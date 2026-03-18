<?php

namespace App\Notifications;

use App\Models\Application;
use App\Notifications\Channels\ExpoPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewApplicationNotification extends Notification
{
    use Queueable;

    public function __construct(public Application $application) {}

    public function via(): array
    {
        return ['database', ExpoPushChannel::class];
    }

    public function toArray(): array
    {
        return [
            'title' => 'New Application Received',
            'message' => "{$this->application->student->full_name} applied for {$this->application->slot->title}",
            'application_id' => $this->application->id,
            'link' => '/site-applications',
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
                'screen' => 'SiteApplications',
            ],
        ];
    }
}
