<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class CredentialExpirationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Collection $credentials,
    ) {}

    public function envelope(): Envelope
    {
        $count = $this->credentials->count();

        return new Envelope(
            subject: "{$count} Credential" . ($count > 1 ? 's' : '') . " Expiring Soon - ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.credential-expiration',
        );
    }
}
