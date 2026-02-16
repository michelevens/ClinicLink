<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class UniversityLicenseCode extends Model
{
    use HasUuids;

    protected $fillable = [
        'university_id',
        'code',
        'max_uses',
        'times_used',
        'expires_at',
        'is_active',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'is_active' => 'boolean',
            'max_uses' => 'integer',
            'times_used' => 'integer',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function users()
    {
        return $this->hasMany(User::class, 'sponsored_by_code_id');
    }

    public function isValid(): bool
    {
        if (!$this->is_active) return false;
        if ($this->expires_at && $this->expires_at->isPast()) return false;
        if ($this->max_uses !== null && $this->times_used >= $this->max_uses) return false;
        return true;
    }
}
