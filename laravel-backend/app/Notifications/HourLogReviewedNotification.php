<?php

namespace App\Notifications;

use App\Models\HourLog;
use App\Notifications\Channels\ExpoPushChannel;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HourLogReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(public HourLog $hourLog, public string $status) {}

    public function via(): array
    {
        return ['database', ExpoPushChannel::class];
    }

    public function toArray(): array
    {
        $statusText = $this->status === 'approved' ? 'approved' : 'rejected';

        return [
            'title' => 'Hour Log ' . ucfirst($statusText),
            'message' => "Your {$this->hourLog->hours_worked}h log for {$this->hourLog->date} has been {$statusText}.",
            'hour_log_id' => $this->hourLog->id,
            'status' => $this->status,
            'link' => '/hours',
        ];
    }

    public function toPush(object $notifiable): array
    {
        $data = $this->toArray();
        return [
            'title' => $data['title'],
            'body' => $data['message'],
            'data' => [
                'type' => 'hour_log',
                'hourLogId' => $this->hourLog->id,
                'screen' => 'HourLog',
            ],
        ];
    }
}
