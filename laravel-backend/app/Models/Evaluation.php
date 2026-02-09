<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Evaluation extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'type',
        'student_id',
        'preceptor_id',
        'slot_id',
        'ratings',
        'comments',
        'overall_score',
        'strengths',
        'areas_for_improvement',
        'is_submitted',
    ];

    protected function casts(): array
    {
        return [
            'ratings' => 'array',
            'overall_score' => 'decimal:1',
            'is_submitted' => 'boolean',
        ];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function preceptor()
    {
        return $this->belongsTo(User::class, 'preceptor_id');
    }

    public function slot()
    {
        return $this->belongsTo(RotationSlot::class, 'slot_id');
    }

    public function scopeSubmitted($query)
    {
        return $query->where('is_submitted', true);
    }
}
