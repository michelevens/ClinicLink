<?php

namespace App\Notifications;

use App\Models\SavedSearch;
use Illuminate\Bus\Queueable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Notifications\Notification;

class SavedSearchAlertNotification extends Notification
{
    use Queueable;

    public function __construct(
        public SavedSearch $savedSearch,
        public Collection $newSlots,
    ) {}

    public function via(object $notifiable): array
    {
        return $notifiable->wantsNotification('reminders') ? ['database'] : [];
    }

    public function toArray(): array
    {
        $count = $this->newSlots->count();

        return [
            'title' => 'New Matching Rotations',
            'message' => "{$count} new rotation(s) match your saved search \"{$this->savedSearch->name}\".",
            'saved_search_id' => $this->savedSearch->id,
            'slot_count' => $count,
            'link' => '/rotations',
        ];
    }
}
