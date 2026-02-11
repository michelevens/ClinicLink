<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'student_id',
        'slot_id',
        'status',
        'cover_letter',
        'submitted_at',
        'reviewed_at',
        'reviewed_by',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'submitted_at' => 'datetime',
            'reviewed_at' => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function slot()
    {
        return $this->belongsTo(RotationSlot::class, 'slot_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    public function onboardingTasks()
    {
        return $this->hasMany(OnboardingTask::class)->orderBy('order');
    }

    public function ceCertificate()
    {
        return $this->hasOne(CeCertificate::class);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }
}
