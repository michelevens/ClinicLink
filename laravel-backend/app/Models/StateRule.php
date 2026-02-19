<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StateRule extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'state',
        'practice_level',
        'supervision_required',
        'max_np_ratio',
        'chart_review_percent',
        'telehealth_allowed',
        'last_updated',
    ];

    protected function casts(): array
    {
        return [
            'supervision_required' => 'boolean',
            'telehealth_allowed' => 'boolean',
            'last_updated' => 'date',
        ];
    }

    public function scopeFullPractice($query)
    {
        return $query->where('practice_level', 'full');
    }

    public function scopeSupervisionRequired($query)
    {
        return $query->where('supervision_required', true);
    }
}
