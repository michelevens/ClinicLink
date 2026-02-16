<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class StudentInvite extends Model
{
    use HasUuids;

    protected $fillable = [
        'university_id',
        'program_id',
        'invited_by',
        'token',
        'email',
        'status',
        'accepted_by',
        'accepted_at',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'accepted_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function inviter()
    {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function acceptedByUser()
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending' && $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->status === 'pending' && $this->expires_at->isPast();
    }
}
