<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RotationSite extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'address',
        'city',
        'state',
        'zip',
        'phone',
        'website',
        'description',
        'specialties',
        'ehr_system',
        'photos',
        'manager_id',
        'rating',
        'review_count',
        'is_verified',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
            'photos' => 'array',
            'rating' => 'decimal:1',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    public function slots()
    {
        return $this->hasMany(RotationSlot::class, 'site_id');
    }

    public function affiliationAgreements()
    {
        return $this->hasMany(AffiliationAgreement::class, 'site_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeVerified($query)
    {
        return $query->where('is_verified', true);
    }

    public function onboardingTemplates()
    {
        return $this->hasMany(OnboardingTemplate::class, 'site_id');
    }
}
