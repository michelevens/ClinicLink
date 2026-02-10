<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Application $application,
        public string $status,
    ) {}

    public function envelope(): Envelope
    {
        $statusLabel = match ($this->status) {
            'accepted' => 'Accepted',
            'declined' => 'Declined',
            'waitlisted' => 'Waitlisted',
            default => 'Updated',
        };

        return new Envelope(
            subject: "Application {$statusLabel} - ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-status',
        );
    }
}
