<?php

namespace App\Notifications;

use App\Models\Application;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class EvaluationDueNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Application $application,
        public string $evaluationType,
        public Carbon $dueDate,
    ) {}

    public function via(object $notifiable): array
    {
        return $notifiable->wantsNotification('evaluations') ? ['database'] : [];
    }

    public function toArray(): array
    {
        $typeLabel = ucfirst(str_replace('_', '-', $this->evaluationType));

        return [
            'title' => "{$typeLabel} Evaluation Due",
            'message' => "Evaluation for {$this->application->student->full_name} is due on {$this->dueDate->format('M j, Y')}.",
            'application_id' => $this->application->id,
            'slot_id' => $this->application->slot_id,
            'evaluation_type' => $this->evaluationType,
            'due_date' => $this->dueDate->toDateString(),
            'link' => '/evaluations',
        ];
    }
}
