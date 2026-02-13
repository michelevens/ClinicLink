<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class CeEvidenceSnapshot extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'ce_certificate_id',
        'policy_snapshot',
        'eligibility_snapshot',
        'evaluation_snapshot',
        'hour_logs_snapshot',
        'preceptor_credentials_snapshot',
        'rotation_snapshot',
    ];

    protected function casts(): array
    {
        return [
            'policy_snapshot' => 'array',
            'eligibility_snapshot' => 'array',
            'evaluation_snapshot' => 'array',
            'hour_logs_snapshot' => 'array',
            'preceptor_credentials_snapshot' => 'array',
            'rotation_snapshot' => 'array',
        ];
    }

    // ── Immutability Guards ──────────────────────────────────────

    public function save(array $options = [])
    {
        if ($this->exists) {
            throw new \RuntimeException('CeEvidenceSnapshot records are immutable and cannot be updated.');
        }

        return parent::save($options);
    }

    public function delete()
    {
        throw new \RuntimeException('CeEvidenceSnapshot records are immutable and cannot be deleted.');
    }

    // ── Static Factory ───────────────────────────────────────────

    /**
     * Capture a point-in-time evidence snapshot for a CE certificate.
     */
    public static function capture(
        string $certificateId,
        array $eligibility,
        Application $application,
    ): ?self {
        try {
            $application->loadMissing(['slot.site', 'student.studentProfile']);
            $slot = $application->slot;
            $studentId = $application->student_id;

            // Gather submitted evaluations for this rotation
            $evaluations = Evaluation::where('student_id', $studentId)
                ->where('slot_id', $slot->id)
                ->where('is_submitted', true)
                ->get(['id', 'type', 'overall_score', 'is_submitted', 'created_at'])
                ->toArray();

            // Gather approved hour logs for this rotation
            $hourLogs = HourLog::where('student_id', $studentId)
                ->where('slot_id', $slot->id)
                ->where('status', 'approved')
                ->get(['id', 'date', 'hours_worked', 'category', 'status', 'approved_by', 'approved_at'])
                ->toArray();

            // Gather preceptor credentials
            $preceptorCredentials = Credential::where('user_id', $slot->preceptor_id)
                ->get(['id', 'type', 'name', 'expiration_date', 'status'])
                ->toArray();

            // Policy snapshot from the eligibility result
            $policy = $eligibility['policy'] ?? null;
            $policySnapshot = $policy ? $policy->toArray() : [];

            return self::create([
                'ce_certificate_id' => $certificateId,
                'policy_snapshot' => $policySnapshot,
                'eligibility_snapshot' => [
                    'eligible' => $eligibility['eligible'],
                    'reason' => $eligibility['reason'],
                    'contact_hours' => $eligibility['contact_hours'] ?? null,
                    'approved_hours' => $eligibility['approved_hours'] ?? null,
                    'approval_required' => $eligibility['approval_required'] ?? null,
                    'checked_at' => now()->toIso8601String(),
                ],
                'evaluation_snapshot' => $evaluations,
                'hour_logs_snapshot' => $hourLogs,
                'preceptor_credentials_snapshot' => $preceptorCredentials,
                'rotation_snapshot' => [
                    'slot_id' => $slot->id,
                    'site_id' => $slot->site_id,
                    'site_name' => $slot->site?->name,
                    'specialty' => $slot->specialty,
                    'start_date' => $slot->start_date?->toDateString(),
                    'end_date' => $slot->end_date?->toDateString(),
                    'preceptor_id' => $slot->preceptor_id,
                ],
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to capture CE evidence snapshot', [
                'certificate_id' => $certificateId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    // ── Relations ────────────────────────────────────────────────

    public function ceCertificate()
    {
        return $this->belongsTo(CeCertificate::class);
    }
}
