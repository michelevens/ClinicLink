<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;

class OnboardingTask extends Model
{
    use HasUuids;

    protected $fillable = [
        'application_id',
        'item_id',
        'title',
        'description',
        'is_required',
        'order',
        'completed_at',
        'completed_by',
        'verified_at',
        'verified_by',
        'verification_notes',
        'file_path',
        'file_name',
        'file_size',
    ];

    protected function casts(): array
    {
        return [
            'is_required' => 'boolean',
            'completed_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function item()
    {
        return $this->belongsTo(OnboardingItem::class, 'item_id');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'completed_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function scopeRequired($query)
    {
        return $query->where('is_required', true);
    }

    public function scopeCompleted($query)
    {
        return $query->whereNotNull('completed_at');
    }

    public function scopeVerified($query)
    {
        return $query->whereNotNull('verified_at');
    }
}
