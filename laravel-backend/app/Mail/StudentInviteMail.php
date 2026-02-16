<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class StudentInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $universityName,
        public string $inviterName,
        public string $inviteUrl,
        public ?string $customMessage = null,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You're Invited to Join {$this->universityName} on ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.student-invite',
        );
    }
}
