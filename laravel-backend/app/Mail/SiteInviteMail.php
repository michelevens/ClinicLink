<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SiteInviteMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public string $siteName,
        public string $inviterName,
        public string $inviteUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "You're Invited to Join {$this->siteName} on ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.site-invite',
        );
    }
}
