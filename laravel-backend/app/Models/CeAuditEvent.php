<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Log;

class CeAuditEvent extends Model
{
    use HasUuids;

    const UPDATED_AT = null;

    protected $fillable = [
        'ce_certificate_id',
        'event_type',
        'actor_id',
        'actor_role',
        'metadata',
        'ip_address',
        'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
        ];
    }

    // ── Immutability Guards ──────────────────────────────────────

    public function save(array $options = [])
    {
        if ($this->exists) {
            throw new \RuntimeException('CeAuditEvent records are immutable and cannot be updated.');
        }

        return parent::save($options);
    }

    public function delete()
    {
        throw new \RuntimeException('CeAuditEvent records are immutable and cannot be deleted.');
    }

    // ── Static Factories ─────────────────────────────────────────

    /**
     * Record an audit event. Failures are logged but never bubble up.
     */
    public static function record(
        string $certificateId,
        string $eventType,
        ?string $actorId,
        string $actorRole,
        ?array $metadata = null,
        ?string $ipAddress = null,
        ?string $userAgent = null,
    ): ?self {
        try {
            return self::create([
                'ce_certificate_id' => $certificateId,
                'event_type' => $eventType,
                'actor_id' => $actorId,
                'actor_role' => $actorRole,
                'metadata' => $metadata,
                'ip_address' => $ipAddress,
                'user_agent' => $userAgent,
            ]);
        } catch (\Throwable $e) {
            Log::error('Failed to record CE audit event', [
                'event_type' => $eventType,
                'certificate_id' => $certificateId,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Record from an HTTP request context.
     */
    public static function recordFromRequest(
        string $certificateId,
        string $eventType,
        ?\Illuminate\Http\Request $request = null,
        ?array $metadata = null,
    ): ?self {
        $user = $request?->user();

        return self::record(
            certificateId: $certificateId,
            eventType: $eventType,
            actorId: $user?->id,
            actorRole: $user?->role ?? 'public',
            metadata: $metadata,
            ipAddress: $request?->ip(),
            userAgent: $request ? substr((string) $request->userAgent(), 0, 500) : null,
        );
    }

    // ── Relations ────────────────────────────────────────────────

    public function ceCertificate()
    {
        return $this->belongsTo(CeCertificate::class);
    }

    public function actor()
    {
        return $this->belongsTo(User::class, 'actor_id');
    }
}
