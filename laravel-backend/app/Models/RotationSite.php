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
        'npi_number',
        'npi_verified_at',
        'npi_data',
        'system_id',
    ];

    protected static function booted(): void
    {
        static::creating(function (RotationSite $site) {
            if (!$site->system_id) {
                do {
                    $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 7));
                } while (static::where('system_id', $code)->exists());
                $site->system_id = $code;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
            'photos' => 'array',
            'rating' => 'decimal:1',
            'is_verified' => 'boolean',
            'is_active' => 'boolean',
            'npi_data' => 'array',
            'npi_verified_at' => 'datetime',
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

    public function invites()
    {
        return $this->hasMany(SiteInvite::class, 'site_id');
    }
}
