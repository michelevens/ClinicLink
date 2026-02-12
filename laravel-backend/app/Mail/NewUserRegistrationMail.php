<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewUserRegistrationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $newUser,
        public string $reviewUrl,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'New User Registration - ' . $this->newUser->first_name . ' ' . $this->newUser->last_name,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-user-registration',
        );
    }
}
