<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UniversityCePolicy extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'university_id',
        'offers_ce',
        'accrediting_body',
        'contact_hours_per_rotation',
        'max_hours_per_year',
        'requires_final_evaluation',
        'requires_midterm_evaluation',
        'requires_minimum_hours',
        'minimum_hours_required',
        'approval_required',
        'certificate_template_path',
        'signer_name',
        'signer_credentials',
    ];

    protected function casts(): array
    {
        return [
            'offers_ce' => 'boolean',
            'contact_hours_per_rotation' => 'decimal:2',
            'max_hours_per_year' => 'decimal:2',
            'requires_final_evaluation' => 'boolean',
            'requires_midterm_evaluation' => 'boolean',
            'requires_minimum_hours' => 'boolean',
            'minimum_hours_required' => 'decimal:2',
            'approval_required' => 'boolean',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }
}
