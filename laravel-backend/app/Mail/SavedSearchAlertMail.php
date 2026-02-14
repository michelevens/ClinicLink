<?php

namespace App\Mail;

use App\Models\SavedSearch;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SavedSearchAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public User $user,
        public SavedSearch $savedSearch,
        public Collection $newSlots,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "{$this->newSlots->count()} New Rotation(s) Match \"{$this->savedSearch->name}\" - ClinicLink",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.saved-search-alert',
        );
    }
}
