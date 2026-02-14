<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AgreementTemplate extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'university_id',
        'name',
        'description',
        'default_notes',
        'file_path',
        'file_name',
        'file_size',
        'created_by',
    ];

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
