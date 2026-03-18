<?php

namespace App\Notifications\Channels;

use App\Services\PushNotificationService;
use Illuminate\Notifications\Notification;

class ExpoPushChannel
{
    public function __construct(private PushNotificationService $pushService) {}

    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toPush')) {
            return;
        }

        $data = $notification->toPush($notifiable);
        if (empty($data)) return;

        $title = $data['title'] ?? 'ClinicLink';
        $body = $data['body'] ?? '';
        $extra = $data['data'] ?? [];

        $this->pushService->sendToUser($notifiable, $title, $body, $extra);
    }
}
