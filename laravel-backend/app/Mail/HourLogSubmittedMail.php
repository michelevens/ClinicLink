<?php

namespace App\Mail;

use App\Models\HourLog;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class HourLogSubmittedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public HourLog $hourLog,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New Hour Log Submitted for Review - ClinicLink',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.hour-log-submitted',
        );
    }
}
