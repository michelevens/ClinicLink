<?php

namespace App\Notifications;

use App\Models\HourLog;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class HourLogSubmittedNotification extends Notification
{
    use Queueable;

    public function __construct(public HourLog $hourLog) {}

    public function via(object $notifiable): array
    {
        return $notifiable->wantsNotification('hour_log_reviews') ? ['database'] : [];
    }

    public function toArray(): array
    {
        return [
            'title' => 'Hour Log Pending Review',
            'message' => "{$this->hourLog->student->full_name} submitted {$this->hourLog->hours_worked}h on {$this->hourLog->date}",
            'hour_log_id' => $this->hourLog->id,
            'link' => '/hour-logs',
        ];
    }
}
