<?php

namespace App\Mail;

use App\Models\RotationSlot;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class EvaluationReminderMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $preceptor,
        public User $student,
        public RotationSlot $slot,
        public string $evaluationType,
        public Carbon $dueDate,
    ) {}

    public function envelope(): Envelope
    {
        $typeLabel = ucfirst(str_replace('_', '-', $this->evaluationType));

        return new Envelope(
            subject: "Evaluation Due: {$this->student->full_name} - {$typeLabel} ({$this->dueDate->format('M j, Y')}) - ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.evaluation-reminder',
        );
    }
}
