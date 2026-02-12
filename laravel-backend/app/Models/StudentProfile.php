<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class StudentProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'university_id',
        'program_id',
        'graduation_date',
        'gpa',
        'clinical_interests',
        'hours_completed',
        'prior_hours',
        'bio',
        'resume_url',
    ];

    protected function casts(): array
    {
        return [
            'graduation_date' => 'date',
            'gpa' => 'decimal:2',
            'clinical_interests' => 'array',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function program()
    {
        return $this->belongsTo(Program::class);
    }

    public function getRequiredHoursAttribute(): int
    {
        return $this->program?->required_hours ?? 0;
    }

    public function getTotalHoursAttribute(): float
    {
        return $this->prior_hours + $this->hours_completed;
    }

    public function getHoursProgressAttribute(): float
    {
        $required = $this->required_hours;
        if ($required === 0) return 0;
        return round(($this->total_hours / $required) * 100, 1);
    }

    public function getRemainingHoursAttribute(): int
    {
        return max(0, $this->required_hours - $this->total_hours);
    }
}
