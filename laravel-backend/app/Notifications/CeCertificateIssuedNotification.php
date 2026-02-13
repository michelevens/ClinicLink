<?php

namespace App\Notifications;

use App\Models\CeCertificate;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class CeCertificateIssuedNotification extends Notification
{
    use Queueable;

    public function __construct(public CeCertificate $ceCertificate) {}

    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toArray(): array
    {
        return [
            'title' => 'CE Certificate Issued',
            'message' => "You've earned {$this->ceCertificate->contact_hours} CE contact hours.",
            'ce_certificate_id' => $this->ceCertificate->id,
            'link' => '/ce-credits',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $this->ceCertificate->loadMissing([
            'university',
            'application.slot.site',
            'application.student',
        ]);

        $slot = $this->ceCertificate->application->slot ?? null;
        $student = $this->ceCertificate->application->student ?? null;

        return (new MailMessage)
            ->subject('CE Certificate Issued — ClinicLink')
            ->view('emails.ce-certificate-issued', [
                'ceCertificate' => $this->ceCertificate,
                'preceptorName' => $notifiable->first_name,
                'studentName' => $student ? "{$student->first_name} {$student->last_name}" : 'N/A',
                'siteName' => $slot?->site?->name ?? 'N/A',
                'specialty' => $slot?->specialty ?? 'N/A',
                'universityName' => $this->ceCertificate->university?->name ?? 'N/A',
                'contactHours' => number_format($this->ceCertificate->contact_hours, 1),
                'dashboardUrl' => config('app.frontend_url', 'https://michelevens.github.io/ClinicLink') . '/ce-credits',
            ]);
    }
}
