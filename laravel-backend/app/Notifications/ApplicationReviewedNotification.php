<?php

namespace App\Notifications;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ApplicationReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(public Application $application, public string $status) {}

    public function via(): array
    {
        return ['database'];
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
}
