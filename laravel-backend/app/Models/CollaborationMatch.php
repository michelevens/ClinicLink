<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollaborationMatch extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'request_id',
        'physician_profile_id',
        'status',
        'match_score',
        'match_reasons',
        'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'match_score' => 'decimal:2',
            'match_reasons' => 'array',
            'responded_at' => 'datetime',
        ];
    }

    public function request()
    {
        return $this->belongsTo(CollaborationRequest::class, 'request_id');
    }

    public function physicianProfile()
    {
        return $this->belongsTo(PhysicianProfile::class);
    }
}
