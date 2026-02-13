<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class AgreementExpirationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public Collection $agreements,
    ) {}

    public function envelope(): Envelope
    {
        $count = $this->agreements->count();

        return new Envelope(
            subject: "{$count} Affiliation Agreement" . ($count > 1 ? 's' : '') . " Expiring Soon - ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.agreement-expiration',
        );
    }
}
