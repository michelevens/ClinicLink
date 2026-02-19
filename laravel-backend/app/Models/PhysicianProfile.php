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
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'licensed_states' => 'array',
            'specialties' => 'array',
            'malpractice_confirmed' => 'boolean',
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
}
