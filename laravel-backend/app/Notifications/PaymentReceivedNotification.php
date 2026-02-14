<?php

namespace App\Notifications;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class PaymentReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(public Payment $payment) {}

    public function via(): array
    {
        return ['database'];
    }

    public function toArray(): array
    {
        $isPayer = true; // Will be contextualized by the notifiable

        return [
            'title' => 'Payment Processed',
            'message' => "Payment of \${$this->payment->amount} for {$this->payment->slot->title} has been processed.",
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount,
            'status' => $this->payment->status,
            'link' => '/settings?tab=payments',
        ];
    }
}
