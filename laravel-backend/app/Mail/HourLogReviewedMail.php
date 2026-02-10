<?php

namespace App\Mail;

use App\Models\HourLog;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class HourLogReviewedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public HourLog $hourLog,
        public string $status,
    ) {}

    public function envelope(): Envelope
    {
        $label = $this->status === 'approved' ? 'Approved' : 'Rejected';

        return new Envelope(
            subject: "Hour Log {$label} - ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.hour-log-reviewed',
        );
    }
}
