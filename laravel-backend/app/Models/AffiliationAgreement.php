<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AffiliationAgreement extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'university_id',
        'site_id',
        'status',
        'signature_status',
        'start_date',
        'end_date',
        'document_url',
        'file_path',
        'file_name',
        'file_size',
        'notes',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function university()
    {
        return $this->belongsTo(University::class);
    }

    public function site()
    {
        return $this->belongsTo(RotationSite::class, 'site_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function signatures()
    {
        return $this->morphMany(Signature::class, 'signable');
    }

    public function isActive(): bool
    {
        return $this->status === 'active' && (!$this->end_date || $this->end_date->isFuture());
    }

    /**
     * Recalculate signature_status based on current signatures.
     */
    public function refreshSignatureStatus(): void
    {
        $signatures = $this->signatures()->get();

        if ($signatures->isEmpty()) {
            $this->update(['signature_status' => 'none']);
            return;
        }

        $requested = $signatures->where('status', 'requested')->count();
        $signed = $signatures->where('status', 'signed')->count();

        if ($requested === 0 && $signed > 0) {
            $this->update(['signature_status' => 'fully_signed']);
        } elseif ($signed > 0 && $requested > 0) {
            $this->update(['signature_status' => 'partially_signed']);
        } else {
            $this->update(['signature_status' => 'pending']);
        }
    }
}
