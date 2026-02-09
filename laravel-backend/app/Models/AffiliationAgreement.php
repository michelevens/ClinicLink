<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliationAgreement extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'university_id',
        'site_id',
        'status',
        'start_date',
        'end_date',
        'document_url',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function site()
    {
        return $this->belongsTo(RotationSite::class, 'site_id');
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && (!$this->end_date || $this->end_date->isFuture());
    }
}
