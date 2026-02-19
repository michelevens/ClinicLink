<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CollaborationRequest extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'profession_type',
        'states_requested',
        'specialty',
        'practice_model',
        'expected_start_date',
        'preferred_supervision_model',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'states_requested' => 'array',
            'expected_start_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function matches()
    {
        return $this->hasMany(CollaborationMatch::class, 'request_id');
    }
}
