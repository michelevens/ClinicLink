<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RotationSlot extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'site_id',
        'specialty',
        'title',
        'description',
        'start_date',
        'end_date',
        'capacity',
        'filled',
        'requirements',
        'cost',
        'cost_type',
        'status',
        'preceptor_id',
        'shift_schedule',
    ];

    protected function casts(): array
    {
        return [
            'requirements' => 'array',
            'start_date' => 'date',
            'end_date' => 'date',
            'cost' => 'decimal:2',
        ];
    }

    public function site()
    {
        return $this->belongsTo(RotationSite::class, 'site_id');
    }

    public function preceptor()
    {
        return $this->belongsTo(User::class, 'preceptor_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'slot_id');
    }

    public function hourLogs()
    {
        return $this->hasMany(HourLog::class, 'slot_id');
    }

    public function evaluations()
    {
        return $this->hasMany(Evaluation::class, 'slot_id');
    }

    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    public function scopeUpcoming($query)
    {
        return $query->where('start_date', '>', now());
    }

    public function hasAvailability(): bool
    {
        return $this->filled < $this->capacity;
    }
}
