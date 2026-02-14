<?php

namespace App\Mail;

use App\Models\AffiliationAgreement;
use App\Models\Signature;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SignatureRequestMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public Signature $signature,
        public AffiliationAgreement $agreement,
        public User $requester,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Signature Requested: {$this->agreement->university->name} & {$this->agreement->site->name} - ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.signature-request',
        );
    }
}
