<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Signature extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'signable_type',
        'signable_id',
        'signer_role',
        'signer_name',
        'signer_email',
        'signer_id',
        'requested_by',
        'status',
        'signature_data',
        'ip_address',
        'user_agent',
        'request_message',
        'rejection_reason',
        'requested_at',
        'signed_at',
        'rejected_at',
    ];

    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'signed_at' => 'datetime',
            'rejected_at' => 'datetime',
        ];
    }

    // --- Relationships ---

    public function signable()
    {
        return $this->morphTo();
    }

    public function signer()
    {
        return $this->belongsTo(User::class, 'signer_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    // --- Scopes ---

    public function scopeRequested($query)
    {
        return $query->where('status', 'requested');
    }

    public function scopeSigned($query)
    {
        return $query->where('status', 'signed');
    }

    public function scopeForUser($query, User $user)
    {
        return $query->where(function ($q) use ($user) {
            $q->where('signer_id', $user->id)
              ->orWhere('signer_email', $user->email);
        });
    }

    // --- Helpers ---

    public function isPending(): bool
    {
        return $this->status === 'requested';
    }

    public function isSigned(): bool
    {
        return $this->status === 'signed';
    }
}
