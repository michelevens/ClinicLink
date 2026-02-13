<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CeCertificate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'university_id',
        'preceptor_id',
        'application_id',
        'contact_hours',
        'status',
        'issued_at',
        'approved_by',
        'certificate_path',
        'verification_uuid',
        'rejection_reason',
        'revoked_at',
        'revoked_by',
        'revocation_reason',
        'policy_version_id',
    ];

    protected function casts(): array
    {
        return [
            'contact_hours' => 'decimal:2',
            'issued_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function preceptor()
    {
        return $this->belongsTo(User::class, 'preceptor_id');
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function approvedByUser()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }

    public function scopeRevoked($query)
    {
        return $query->where('status', 'revoked');
    }

    public function revokedByUser()
    {
        return $this->belongsTo(User::class, 'revoked_by');
    }

    public function auditEvents()
    {
        return $this->hasMany(CeAuditEvent::class)->orderBy('created_at');
    }

    public function evidenceSnapshot()
    {
        return $this->hasOne(CeEvidenceSnapshot::class);
    }

    public function isRevoked(): bool
    {
        return $this->status === 'revoked';
    }
}
