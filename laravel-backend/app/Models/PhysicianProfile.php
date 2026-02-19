<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PhysicianProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'licensed_states',
        'specialties',
        'max_supervisees',
        'supervision_model',
        'malpractice_confirmed',
        'malpractice_document_url',
        'bio',
        'stripe_connect_account_id',
        'stripe_connect_status',
        'stripe_connect_onboarded_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'licensed_states' => 'array',
            'specialties' => 'array',
            'malpractice_confirmed' => 'boolean',
            'stripe_connect_onboarded_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function matches()
    {
        return $this->hasMany(CollaborationMatch::class);
    }

    public function activeSuperviseeCount(): int
    {
        return $this->matches()->where('status', 'accepted')->count();
    }

    public function hasCapacity(): bool
    {
        return $this->activeSuperviseeCount() < $this->max_supervisees;
    }

    public function hasStripeConnectVerified(): bool
    {
        return $this->stripe_connect_status === 'verified'
            && $this->stripe_connect_account_id !== null;
    }
}
