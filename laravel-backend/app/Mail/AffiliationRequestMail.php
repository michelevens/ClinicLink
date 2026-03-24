<?php

namespace App\Mail;

use App\Models\AffiliationAgreement;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AffiliationRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public AffiliationAgreement $agreement,
        public User $student,
        public string $recipientRole,
        public string $reviewUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Affiliation Request — ClinicLink',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.affiliation-request',
        );
    }
}
