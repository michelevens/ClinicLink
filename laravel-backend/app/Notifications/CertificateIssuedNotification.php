<?php

namespace App\Notifications;

use App\Models\Certificate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CertificateIssuedNotification extends Notification
{
    use Queueable;

    public function __construct(public Certificate $certificate) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(): array
    {
        return [
            'title' => 'Certificate Issued',
            'message' => "You've been awarded a certificate for completing {$this->certificate->title}.",
            'certificate_id' => $this->certificate->id,
            'certificate_number' => $this->certificate->certificate_number,
            'link' => '/certificates',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->certificate->loadMissing(['slot.site', 'issuer']);

        return (new MailMessage)
            ->subject('Congratulations! Your Certificate of Completion')
            ->view('emails.certificate-issued', [
                'certificate' => $this->certificate,
                'studentName' => $notifiable->first_name,
                'dashboardUrl' => config('app.frontend_url', 'https://michelevens.github.io/ClinicLink') . '/certificates',
            ]);
    }
}
