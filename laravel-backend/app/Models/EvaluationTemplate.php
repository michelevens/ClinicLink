<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EvaluationTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'university_id',
        'type',
        'name',
        'categories',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'categories' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
