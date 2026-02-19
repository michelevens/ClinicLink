<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupervisionAgreement extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'collaboration_match_id',
        'status',
        'monthly_fee_cents',
        'platform_fee_percent',
        'platform_fee_cents',
        'billing_anchor',
        'stripe_subscription_id',
        'stripe_customer_id',
        'stripe_connected_account_id',
        'last_payment_status',
        'signed_at',
        'activated_at',
        'paused_at',
        'terminated_at',
        'termination_reason',
    ];

    protected function casts(): array
    {
        return [
            'monthly_fee_cents' => 'integer',
            'platform_fee_percent' => 'decimal:2',
            'platform_fee_cents' => 'integer',
            'billing_anchor' => 'integer',
            'signed_at' => 'datetime',
            'activated_at' => 'datetime',
            'paused_at' => 'datetime',
            'terminated_at' => 'datetime',
        ];
    }

    // Relationships

    public function collaborationMatch()
    {
        return $this->belongsTo(CollaborationMatch::class);
    }

    // State helpers

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function isPendingSignature(): bool
    {
        return $this->status === 'pending_signature';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isPaused(): bool
    {
        return $this->status === 'paused';
    }

    public function isTerminated(): bool
    {
        return $this->status === 'terminated';
    }

    public function canTransitionTo(string $newStatus): bool
    {
        $validTransitions = [
            'draft' => ['pending_signature', 'terminated'],
            'pending_signature' => ['active', 'terminated'],
            'active' => ['paused', 'terminated'],
            'paused' => ['active', 'terminated'],
            'terminated' => [],
        ];

        return in_array($newStatus, $validTransitions[$this->status] ?? []);
    }

    // Computed fields

    public function getTotalMonthlyCents(): int
    {
        return $this->monthly_fee_cents + $this->platform_fee_cents;
    }

    public function getPhysicianPayoutCents(): int
    {
        return $this->monthly_fee_cents;
    }

    public function getPlatformFeeCents(): int
    {
        return $this->platform_fee_cents;
    }
}
