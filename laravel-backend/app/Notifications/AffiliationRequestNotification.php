<?php

namespace App\Notifications;

use App\Models\AffiliationAgreement;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AffiliationRequestNotification extends Notification
{
    use Queueable;

    public function __construct(
        public AffiliationAgreement $agreement,
        public User $student,
        public string $recipientRole, // 'coordinator' or 'site_manager'
    ) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $siteName = $this->agreement->site?->name ?? 'Unknown Site';
        $uniName = $this->agreement->university?->name ?? 'Unknown University';
        $studentName = $this->student->first_name . ' ' . $this->student->last_name;

        if ($this->recipientRole === 'coordinator') {
            return [
                'title' => 'Student Affiliation Request',
                'message' => "{$studentName} wants to rotate at {$siteName}, but your institution is not yet affiliated. Review the affiliation request.",
                'type' => 'affiliation_request',
                'agreement_id' => $this->agreement->id,
                'student_id' => $this->student->id,
                'site_name' => $siteName,
                'university_name' => $uniName,
            ];
        }

        return [
            'title' => 'New Affiliation Request',
            'message' => "A student from {$uniName} wants to rotate at your site. Review the affiliation request to establish a partnership.",
            'type' => 'affiliation_request',
            'agreement_id' => $this->agreement->id,
            'student_id' => $this->student->id,
            'site_name' => $siteName,
            'university_name' => $uniName,
        ];
    }
}
