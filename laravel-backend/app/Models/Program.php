<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Program extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'university_id',
        'name',
        'degree_type',
        'required_hours',
        'specialties',
    ];

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function studentProfiles()
    {
        return $this->hasMany(StudentProfile::class);
    }
}
