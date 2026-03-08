<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ExclusionScreening extends Model
{
    use HasUuids;

    protected $fillable = [
        'user_id', 'screened_by', 'source', 'match_type',
        'result', 'match_details', 'notes',
    ];

    protected $casts = [
        'match_details' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function screenedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'screened_by');
    }

    public function isMatch(): bool
    {
        return $this->result === 'match_found';
    }

    public function isClear(): bool
    {
        return $this->result === 'clear';
    }
}
