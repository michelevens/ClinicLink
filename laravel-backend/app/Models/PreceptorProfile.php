<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PreceptorProfile extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'user_id',
        'specialties',
        'years_experience',
        'bio',
        'credentials',
        'availability_status',
        'max_students',
        'preferred_schedule',
        'teaching_philosophy',
        'badges',
        'total_students_mentored',
        'total_hours_supervised',
        'profile_visibility',
    ];

    protected function casts(): array
    {
        return [
            'specialties' => 'array',
            'credentials' => 'array',
            'badges' => 'array',
            'total_hours_supervised' => 'decimal:2',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function refreshBadges(): void
    {
        $badges = [];
        $user = $this->user;

        // Mentor badges based on students mentored
        if ($this->total_students_mentored >= 30) {
            $badges[] = 'mentor_gold';
        } elseif ($this->total_students_mentored >= 15) {
            $badges[] = 'mentor_silver';
        } elseif ($this->total_students_mentored >= 5) {
            $badges[] = 'mentor_bronze';
        }

        // Hours badges
        if ($this->total_hours_supervised >= 500) {
            $badges[] = 'hours_500';
        } elseif ($this->total_hours_supervised >= 100) {
            $badges[] = 'hours_100';
        }

        // Top rated badge
        $reviews = PreceptorReview::where('preceptor_id', $user->id)->get();
        if ($reviews->count() >= 5 && $reviews->avg('overall_score') >= 4.5) {
            $badges[] = 'top_rated';
        }

        // Multi-specialty badge
        $specialties = $this->specialties ?? [];
        if (count($specialties) >= 3) {
            $badges[] = 'multi_specialty';
        }

        // Quick responder badge
        $totalLogs = $user->hourLogs ?? collect();
        if (method_exists($user, 'reviewedHourLogs')) {
            $reviewed = \App\Models\HourLog::where('reviewed_by', $user->id)->get();
            $total = $reviewed->count();
            if ($total >= 10) {
                $quickCount = $reviewed->filter(function ($log) {
                    return $log->reviewed_at && $log->created_at &&
                        $log->reviewed_at->diffInHours($log->created_at) <= 48;
                })->count();
                if ($quickCount / $total >= 0.9) {
                    $badges[] = 'quick_responder';
                }
            }
        }

        $this->update(['badges' => $badges]);
    }

    public function refreshStats(): void
    {
        $user = $this->user;

        $mentored = Application::where('status', 'completed')
            ->whereHas('slot', function ($q) use ($user) {
                $q->where('preceptor_id', $user->id);
            })
            ->distinct('student_id')
            ->count('student_id');

        $hours = HourLog::where('status', 'approved')
            ->whereHas('slot', function ($q) use ($user) {
                $q->where('preceptor_id', $user->id);
            })
            ->sum('hours');

        $this->update([
            'total_students_mentored' => $mentored,
            'total_hours_supervised' => $hours,
        ]);
    }
}
