<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, HasUuids, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'username',
        'password',
        'role',
        'phone',
        'avatar_url',
        'is_active',
        'onboarding_completed_at',
        'mfa_enabled',
        'mfa_secret',
        'mfa_confirmed_at',
        'mfa_backup_codes',
        'notification_preferences',
        'failed_login_attempts',
        'locked_until',
        'stripe_account_id',
        'stripe_onboarded',
        'plan',
        'trial_ends_at',
        'free_rotations_used',
        'stripe_customer_id',
        'stripe_subscription_id',
        'subscription_status',
        'subscription_ends_at',
        'sponsored_by_code_id',
    ];

    protected $hidden = [
        'password',
        'remember_token',
        'mfa_secret',
        'mfa_backup_codes',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'mfa_enabled' => 'boolean',
            'mfa_secret' => 'encrypted',
            'mfa_confirmed_at' => 'datetime',
            'mfa_backup_codes' => 'encrypted:array',
            'notification_preferences' => 'array',
            'locked_until' => 'datetime',
            'stripe_onboarded' => 'boolean',
            'trial_ends_at' => 'datetime',
            'subscription_ends_at' => 'datetime',
        ];
    }

    public function wantsNotification(string $type): bool
    {
        $defaults = [
            'application_updates' => true,
            'hour_log_reviews' => true,
            'evaluations' => true,
            'site_join_requests' => true,
            'reminders' => true,
            'product_updates' => false,
        ];
        $prefs = $this->notification_preferences ?? $defaults;
        return $prefs[$type] ?? true;
    }

    // Relationships

    public function studentProfile()
    {
        return $this->hasOne(StudentProfile::class);
    }

    public function credentials()
    {
        return $this->hasMany(Credential::class);
    }

    public function managedSites()
    {
        return $this->hasMany(RotationSite::class, 'manager_id');
    }

    public function preceptorSlots()
    {
        return $this->hasMany(RotationSlot::class, 'preceptor_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class, 'student_id');
    }

    public function hourLogs()
    {
        return $this->hasMany(HourLog::class, 'student_id');
    }

    public function evaluationsAsStudent()
    {
        return $this->hasMany(Evaluation::class, 'student_id');
    }

    public function evaluationsAsPreceptor()
    {
        return $this->hasMany(Evaluation::class, 'preceptor_id');
    }

    public function conversations()
    {
        return $this->belongsToMany(Conversation::class, 'conversation_participants')
            ->withPivot('last_read_at')
            ->withTimestamps();
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function bookmarkedSlots()
    {
        return $this->belongsToMany(RotationSlot::class, 'slot_bookmarks', 'user_id', 'slot_id')
            ->withTimestamps();
    }

    public function preceptorReviewsReceived()
    {
        return $this->hasMany(PreceptorReview::class, 'preceptor_id');
    }

    public function preceptorReviewsGiven()
    {
        return $this->hasMany(PreceptorReview::class, 'student_id');
    }

    public function preceptorProfile()
    {
        return $this->hasOne(PreceptorProfile::class);
    }

    public function matchingPreferences()
    {
        return $this->hasOne(MatchingPreference::class);
    }

    public function paymentsAsPayer()
    {
        return $this->hasMany(Payment::class, 'payer_id');
    }

    public function paymentsAsPayee()
    {
        return $this->hasMany(Payment::class, 'payee_id');
    }

    // Scopes

    public function scopeRole($query, string $role)
    {
        return $query->where('role', $role);
    }

    public function scopeStudents($query)
    {
        return $query->where('role', 'student');
    }

    public function scopePreceptors($query)
    {
        return $query->where('role', 'preceptor');
    }

    // Helpers

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function isPreceptor(): bool
    {
        return $this->role === 'preceptor';
    }

    public function isSiteManager(): bool
    {
        return $this->role === 'site_manager';
    }

    public function isCoordinator(): bool
    {
        return $this->role === 'coordinator';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    // Subscription & plan helpers

    public function hasActivePlan(): bool
    {
        if ($this->plan !== 'free') {
            return in_array($this->subscription_status, ['active', 'trialing']);
        }
        return $this->isWithinFreeTier();
    }

    public function isWithinFreeTier(): bool
    {
        // Students: 1 free rotation OR 3 months, whichever first
        if ($this->isStudent()) {
            $withinTrial = $this->trial_ends_at && $this->trial_ends_at->isFuture();
            $withinRotationLimit = ($this->free_rotations_used ?? 0) < 1;
            return $withinTrial && $withinRotationLimit;
        }
        // Non-students: free tier has no time limit (universities pay separately)
        return true;
    }

    public function needsUpgrade(): bool
    {
        if (!$this->isStudent()) return false;
        if ($this->plan !== 'free') return false;
        return !$this->isWithinFreeTier();
    }

    public function incrementRotationsUsed(): void
    {
        $this->increment('free_rotations_used');
    }

    // Account lockout

    public function isLocked(): bool
    {
        return $this->locked_until && $this->locked_until->isFuture();
    }

    public function incrementFailedLogins(): void
    {
        $this->increment('failed_login_attempts');
        if ($this->failed_login_attempts >= 5) {
            $this->update(['locked_until' => now()->addMinutes(30)]);
        }
    }

    public function resetFailedLogins(): void
    {
        if ($this->failed_login_attempts > 0 || $this->locked_until) {
            $this->update(['failed_login_attempts' => 0, 'locked_until' => null]);
        }
    }
}
