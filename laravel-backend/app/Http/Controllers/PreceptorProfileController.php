<?php

namespace App\Http\Controllers;

use App\Models\PreceptorProfile;
use App\Models\PreceptorReview;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PreceptorProfileController extends Controller
{
    /**
     * Searchable directory of preceptor profiles.
     */
    public function directory(Request $request): JsonResponse
    {
        $query = PreceptorProfile::with('user:id,first_name,last_name,email')
            ->where('profile_visibility', 'public');

        if ($search = $request->query('search')) {
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%");
            });
        }

        if ($specialty = $request->query('specialty')) {
            $query->whereJsonContains('specialties', $specialty);
        }

        if ($availability = $request->query('availability')) {
            $query->where('availability_status', $availability);
        }

        $profiles = $query->orderBy('total_students_mentored', 'desc')
            ->paginate(18);

        // Enrich with review stats
        $profiles->getCollection()->transform(function ($profile) {
            $reviews = PreceptorReview::where('preceptor_id', $profile->user_id);
            $user = $profile->user;

            return [
                'id' => $profile->id,
                'user_id' => $profile->user_id,
                'first_name' => $user->first_name,
                'last_name' => $user->last_name,
                'specialties' => $profile->specialties ?? [],
                'years_experience' => $profile->years_experience,
                'bio' => $profile->bio,
                'availability_status' => $profile->availability_status,
                'badges' => $profile->badges ?? [],
                'total_students_mentored' => $profile->total_students_mentored,
                'total_hours_supervised' => $profile->total_hours_supervised,
                'average_rating' => round($reviews->avg('overall_score') ?? 0, 1) ?: null,
                'review_count' => $reviews->count(),
            ];
        });

        return response()->json($profiles);
    }

    /**
     * Get a specific preceptor's profile.
     */
    public function show(User $user): JsonResponse
    {
        $profile = $user->preceptorProfile;

        if (!$profile) {
            return response()->json(['message' => 'Profile not found'], 404);
        }

        $reviews = PreceptorReview::where('preceptor_id', $user->id);

        return response()->json([
            'id' => $profile->id,
            'user_id' => $user->id,
            'first_name' => $user->first_name,
            'last_name' => $user->last_name,
            'email' => $user->email,
            'specialties' => $profile->specialties ?? [],
            'years_experience' => $profile->years_experience,
            'bio' => $profile->bio,
            'credentials' => $profile->credentials ?? [],
            'availability_status' => $profile->availability_status,
            'max_students' => $profile->max_students,
            'preferred_schedule' => $profile->preferred_schedule,
            'teaching_philosophy' => $profile->teaching_philosophy,
            'badges' => $profile->badges ?? [],
            'total_students_mentored' => $profile->total_students_mentored,
            'total_hours_supervised' => $profile->total_hours_supervised,
            'profile_visibility' => $profile->profile_visibility,
            'average_rating' => round($reviews->avg('overall_score') ?? 0, 1) ?: null,
            'review_count' => $reviews->count(),
        ]);
    }

    /**
     * Update own preceptor profile.
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'specialties' => ['sometimes', 'array'],
            'specialties.*' => ['string'],
            'years_experience' => ['sometimes', 'nullable', 'integer', 'min:0'],
            'bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'credentials' => ['sometimes', 'nullable', 'array'],
            'availability_status' => ['sometimes', 'in:available,limited,unavailable'],
            'max_students' => ['sometimes', 'integer', 'min:1', 'max:20'],
            'preferred_schedule' => ['sometimes', 'nullable', 'string', 'max:500'],
            'teaching_philosophy' => ['sometimes', 'nullable', 'string', 'max:3000'],
            'profile_visibility' => ['sometimes', 'in:public,university_only,private'],
        ]);

        $profile = PreceptorProfile::updateOrCreate(
            ['user_id' => $user->id],
            $validated
        );

        return response()->json($profile);
    }

    /**
     * Admin: refresh a preceptor's badges.
     */
    public function refreshBadges(User $user): JsonResponse
    {
        $profile = $user->preceptorProfile;

        if (!$profile) {
            return response()->json(['message' => 'No preceptor profile found'], 404);
        }

        $profile->refreshStats();
        $profile->refreshBadges();

        return response()->json([
            'badges' => $profile->fresh()->badges,
            'total_students_mentored' => $profile->total_students_mentored,
            'total_hours_supervised' => $profile->total_hours_supervised,
        ]);
    }

    /**
     * Top preceptors leaderboard.
     */
    public function leaderboard(): JsonResponse
    {
        $profiles = PreceptorProfile::with('user:id,first_name,last_name')
            ->where('profile_visibility', 'public')
            ->orderBy('total_students_mentored', 'desc')
            ->limit(10)
            ->get();

        $leaderboard = $profiles->map(function ($profile) {
            $avgRating = PreceptorReview::where('preceptor_id', $profile->user_id)
                ->avg('overall_score');

            return [
                'id' => $profile->user_id,
                'first_name' => $profile->user->first_name,
                'last_name' => $profile->user->last_name,
                'total_students_mentored' => $profile->total_students_mentored,
                'total_hours_supervised' => $profile->total_hours_supervised,
                'badges' => $profile->badges ?? [],
                'average_rating' => $avgRating ? round($avgRating, 1) : null,
            ];
        });

        return response()->json(['leaderboard' => $leaderboard]);
    }
}
