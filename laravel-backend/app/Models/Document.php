<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $fillable = [
        'user_id',
        'documentable_id',
        'documentable_type',
        'folder',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_size',
        'mime_type',
        'expiration_date',
        'status',
        'uploaded_by',
        'visibility',
        'shared_with',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'expiration_date' => 'date',
            'shared_with'     => 'array',
            'metadata'        => 'array',
        ];
    }

    // -------------------------------------------------------------------------
    // Relationships
    // -------------------------------------------------------------------------

    /**
     * The user who owns this document (the document belongs to this user's vault).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The user who physically uploaded the file — may differ from the owner.
     * For example, a coordinator uploads a signed agreement on behalf of a student.
     */
    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    /**
     * Polymorphic parent — links this document back to its source record when it
     * was generated from one (Credential, OnboardingTask, AffiliationAgreement, etc.).
     * Null for standalone uploads.
     */
    public function documentable()
    {
        return $this->morphTo();
    }

    // -------------------------------------------------------------------------
    // Query Scopes
    // -------------------------------------------------------------------------

    /**
     * Only active documents (not expired or archived).
     */
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    /**
     * Documents whose expiration_date is in the past.
     */
    public function scopeExpired($query)
    {
        return $query->where('status', 'expired')
            ->orWhere(function ($q) {
                $q->whereNotNull('expiration_date')
                  ->where('expiration_date', '<', now()->toDateString());
            });
    }

    /**
     * Documents expiring within the given number of days (default 30).
     */
    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->whereNotNull('expiration_date')
            ->whereBetween('expiration_date', [
                now()->toDateString(),
                now()->addDays($days)->toDateString(),
            ]);
    }

    /**
     * Filter to a specific virtual folder.
     *
     * Usage: Document::folder('credentials')->get()
     */
    public function scopeFolder($query, string $folder)
    {
        return $query->where('folder', $folder);
    }

    /**
     * Documents visible to the given user — either they own it, it is public,
     * or they appear in the shared_with JSON array.
     *
     * Note: the shared_with JSON column is a simple array of UUIDs stored in
     * PostgreSQL as JSON. The '?' operator checks for JSON key/element existence.
     */
    public function scopeVisibleTo($query, User $user)
    {
        return $query->where(function ($q) use ($user) {
            $q->where('user_id', $user->id)
              ->orWhere('visibility', 'public')
              ->orWhere(function ($q2) use ($user) {
                  $q2->where('visibility', 'shared')
                     ->whereRaw("shared_with::jsonb @> ?", [json_encode([$user->id])]);
              });
        });
    }

    // -------------------------------------------------------------------------
    // Helper Methods
    // -------------------------------------------------------------------------

    /**
     * True if the document has a set expiration date that has already passed.
     * Mirrors the same pattern used on Credential.
     */
    public function isExpired(): bool
    {
        return $this->expiration_date && $this->expiration_date->isPast();
    }

    /**
     * True if the document expires within the next 30 days.
     * Mirrors the same pattern used on Credential.
     */
    public function isExpiringSoon(): bool
    {
        return $this->expiration_date
            && $this->expiration_date->between(now(), now()->addDays(30));
    }
}
