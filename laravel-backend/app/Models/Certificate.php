<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Certificate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'student_id',
        'slot_id',
        'issued_by',
        'certificate_number',
        'title',
        'total_hours',
        'overall_score',
        'status',
        'issued_date',
        'revoked_date',
        'revocation_reason',
    ];

    protected function casts(): array
    {
        return [
            'total_hours' => 'decimal:1',
            'overall_score' => 'decimal:1',
            'issued_date' => 'date',
            'revoked_date' => 'date',
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

    public function issuer()
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    public function scopeIssued($query)
    {
        return $query->where('status', 'issued');
    }
}
