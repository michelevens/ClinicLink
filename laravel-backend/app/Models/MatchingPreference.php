<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MatchingPreference extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'preferred_specialties',
        'preferred_states',
        'preferred_cities',
        'max_distance_miles',
        'preferred_schedule',
        'cost_preference',
        'min_preceptor_rating',
        'preferred_start_after',
        'preferred_start_before',
        'exclude_applied',
    ];

    protected function casts(): array
    {
        return [
            'preferred_specialties' => 'array',
            'preferred_states' => 'array',
            'preferred_cities' => 'array',
            'min_preceptor_rating' => 'decimal:1',
            'preferred_start_after' => 'date',
            'preferred_start_before' => 'date',
            'exclude_applied' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
