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
        'onboarding_completed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
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
}
