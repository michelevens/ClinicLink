<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AccreditationReport extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'university_id',
        'generated_by',
        'report_type',
        'title',
        'parameters',
        'file_path',
        'file_name',
        'file_size',
        'status',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'parameters' => 'array',
            'generated_at' => 'datetime',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
