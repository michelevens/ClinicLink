<?php

namespace App\Notifications;

use App\Models\HourLog;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HourLogReviewedNotification extends Notification
{
    use Queueable;

    public function __construct(public HourLog $hourLog, public string $status) {}

    public function via(): array
    {
        return ['database'];
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
}
