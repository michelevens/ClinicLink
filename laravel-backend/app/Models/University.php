<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class University extends Model
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
        'is_verified',
        'system_id',
    ];

    protected static function booted(): void
    {
        static::creating(function (University $uni) {
            if (!$uni->system_id) {
                do {
                    $code = strtoupper(substr(bin2hex(random_bytes(4)), 0, 7));
                } while (static::where('system_id', $code)->exists());
                $uni->system_id = $code;
            }
        });
    }

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
        ];
    }

    public function programs()
    {
        return $this->hasMany(Program::class);
    }

    public function studentProfiles()
    {
        return $this->hasMany(StudentProfile::class);
    }

    public function affiliationAgreements()
    {
        return $this->hasMany(AffiliationAgreement::class);
    }

    public function cePolicy()
    {
        return $this->hasOne(UniversityCePolicy::class);
    }

    public function ceCertificates()
    {
        return $this->hasMany(CeCertificate::class);
    }

    public function evaluationTemplates()
    {
        return $this->hasMany(EvaluationTemplate::class);
    }

    public function agreementTemplates()
    {
        return $this->hasMany(AgreementTemplate::class);
    }
}
