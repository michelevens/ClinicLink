<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SlotBookmark extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'slot_id',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function slot()
    {
        return $this->belongsTo(RotationSlot::class, 'slot_id');
    }
}
