<?php

namespace App\Services;

use App\Models\Application;
use App\Models\CeCertificate;
use App\Models\Evaluation;
use App\Models\HourLog;
use App\Models\UniversityCePolicy;

class CEEligibilityService
{
    /**
     * Check if a completed application is eligible for CE credit issuance.
     */
    public function check(Application $application): array
    {
        $application->load(['slot.site', 'student.studentProfile']);

        $universityId = $application->student->studentProfile?->university_id;

        if (!$universityId) {
            return $this->result(false, 'Student has no university affiliation.');
        }

        $policy = UniversityCePolicy::where('university_id', $universityId)->first();

        if (!$policy || !$policy->offers_ce) {
            return $this->result(false, 'University does not offer CE credits.');
        }

        // Check if CE cert already exists for this application
        $existing = CeCertificate::where('application_id', $application->id)->first();
        if ($existing) {
            return $this->result(false, 'CE certificate already exists for this placement.', $existing);
        }

        // Check required evaluations
        $slot = $application->slot;
        $studentId = $application->student_id;

        if ($policy->requires_final_evaluation) {
            $hasFinal = Evaluation::where('student_id', $studentId)
                ->where('slot_id', $slot->id)
                ->where('type', 'final')
                ->where('is_submitted', true)
                ->exists();

            if (!$hasFinal) {
                return $this->result(false, 'Final evaluation not submitted.');
            }
        }

        if ($policy->requires_midterm_evaluation) {
            $hasMidterm = Evaluation::where('student_id', $studentId)
                ->where('slot_id', $slot->id)
                ->where('type', 'mid_rotation')
                ->where('is_submitted', true)
                ->exists();

            if (!$hasMidterm) {
                return $this->result(false, 'Mid-rotation evaluation not submitted.');
            }
        }

        // Check minimum hours
        $totalApprovedHours = HourLog::where('student_id', $studentId)
            ->where('slot_id', $slot->id)
            ->where('status', 'approved')
            ->sum('hours_worked');

        if ($policy->requires_minimum_hours && $totalApprovedHours < $policy->minimum_hours_required) {
            return $this->result(false, "Minimum {$policy->minimum_hours_required} approved hours required. Student has {$totalApprovedHours}.");
        }

        // Calculate contact hours to award
        $contactHours = $policy->contact_hours_per_rotation;

        // Check yearly cap
        if ($policy->max_hours_per_year) {
            $yearStart = now()->startOfYear();
            $hoursThisYear = CeCertificate::where('preceptor_id', $slot->preceptor_id)
                ->where('university_id', $universityId)
                ->whereIn('status', ['approved', 'issued'])
                ->where('created_at', '>=', $yearStart)
                ->sum('contact_hours');

            $remaining = $policy->max_hours_per_year - $hoursThisYear;
            if ($remaining <= 0) {
                return $this->result(false, 'Preceptor has reached the yearly CE hour cap for this university.');
            }

            $contactHours = min($contactHours, $remaining);
        }

        return $this->result(true, 'Eligible for CE credit.', null, [
            'contact_hours' => (float) $contactHours,
            'university_id' => $universityId,
            'preceptor_id' => $slot->preceptor_id,
            'policy' => $policy,
            'approved_hours' => (float) $totalApprovedHours,
            'approval_required' => $policy->approval_required,
        ]);
    }

    private function result(bool $eligible, string $reason, ?CeCertificate $existing = null, array $details = []): array
    {
        return array_merge([
            'eligible' => $eligible,
            'reason' => $reason,
            'existing' => $existing,
        ], $details);
    }
}
