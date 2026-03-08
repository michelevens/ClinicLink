<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OigExclusion extends Model
{
    protected $fillable = [
        'lastname', 'firstname', 'midname', 'busname',
        'general', 'specialty', 'upin', 'npi', 'dob',
        'address', 'city', 'state', 'zip',
        'excltype', 'excldate', 'reindate', 'waiverdate', 'waiverstate',
    ];

    /**
     * Get formatted exclusion date.
     */
    public function getExclusionDateAttribute(): ?string
    {
        if (!$this->excldate || strlen($this->excldate) !== 8) return null;
        return substr($this->excldate, 0, 4) . '-' . substr($this->excldate, 4, 2) . '-' . substr($this->excldate, 6, 2);
    }

    /**
     * Get formatted DOB.
     */
    public function getFormattedDobAttribute(): ?string
    {
        if (!$this->dob || strlen($this->dob) !== 8) return null;
        return substr($this->dob, 0, 4) . '-' . substr($this->dob, 4, 2) . '-' . substr($this->dob, 6, 2);
    }

    /**
     * Get full name.
     */
    public function getFullNameAttribute(): string
    {
        return trim("{$this->firstname} {$this->midname} {$this->lastname}");
    }

    /**
     * Get exclusion type description.
     */
    public function getExclusionTypeDescriptionAttribute(): string
    {
        $types = [
            '1128a1' => 'Conviction of program-related crimes',
            '1128a2' => 'Conviction relating to patient abuse',
            '1128a3' => 'Felony conviction relating to health care fraud',
            '1128a4' => 'Felony conviction relating to controlled substance',
            '1128b1' => 'Misdemeanor conviction relating to health care fraud',
            '1128b2' => 'Conviction relating to obstruction of investigation',
            '1128b4' => 'License revocation or suspension',
            '1128b5' => 'Exclusion or suspension under federal or state health care program',
            '1128b6' => 'Claims for excessive charges or unnecessary services',
            '1128b7' => 'Fraud, kickbacks, and other prohibited activities',
            '1128b8' => 'Entities controlled by a sanctioned individual',
            '1128b9' => 'Failure to disclose required information',
            '1128b10' => 'Failure to return overpayments',
            '1128b11' => 'Failure to grant immediate access',
            '1128b12' => 'Failure to take corrective action',
            '1128b13' => 'Default on health education loan or scholarship obligations',
            '1128b14' => 'Controlled substance violations',
            '1128b15' => 'Individuals controlling a sanctioned entity',
            '1128b16' => 'Making false statements or misrepresentation',
        ];

        $code = strtolower(trim($this->excltype ?? ''));
        return $types[$code] ?? $this->excltype ?? 'Unknown';
    }
}
