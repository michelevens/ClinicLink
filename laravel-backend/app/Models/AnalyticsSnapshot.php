<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnalyticsSnapshot extends Model
{
    use HasFactory, HasUuids;

    public $timestamps = false;

    protected $fillable = [
        'type',
        'entity_id',
        'period',
        'date',
        'metrics',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'metrics' => 'array',
            'date' => 'date',
            'created_at' => 'datetime',
        ];
    }
}
