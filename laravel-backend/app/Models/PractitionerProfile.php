<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PractitionerProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'profession_type',
        'licensed_states',
        'primary_specialty',
        'years_in_practice',
        'current_employer',
        'npi_number',
        'license_numbers',
        'license_document_url',
        'malpractice_document_url',
        'malpractice_confirmed',
        'bio',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'licensed_states' => 'array',
            'license_numbers' => 'array',
            'malpractice_confirmed' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
