<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\PreceptorReview;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PreceptorReviewController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'preceptor_id' => ['required', 'uuid', 'exists:users,id'],
            'slot_id' => ['required', 'uuid', 'exists:rotation_slots,id'],
            'ratings' => ['required', 'array'],
            'ratings.teaching_quality' => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.communication' => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.mentorship' => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.professionalism' => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.feedback_quality' => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.availability' => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.clinical_knowledge' => ['required', 'integer', 'min:1', 'max:5'],
            'ratings.support' => ['required', 'integer', 'min:1', 'max:5'],
            'comments' => ['nullable', 'string', 'max:5000'],
            'overall_score' => ['required', 'numeric', 'min:1', 'max:5'],
            'is_anonymous' => ['sometimes', 'boolean'],
        ]);

        // Verify student had a completed application for this slot
        $hasCompleted = Application::where('student_id', $user->id)
            ->where('slot_id', $validated['slot_id'])
            ->where('status', 'completed')
            ->exists();

        if (!$hasCompleted) {
            return response()->json(['message' => 'You must have a completed rotation for this slot.'], 422);
        }

        // Check for duplicate
        $existing = PreceptorReview::where('student_id', $user->id)
            ->where('preceptor_id', $validated['preceptor_id'])
            ->where('slot_id', $validated['slot_id'])
            ->exists();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this preceptor for this rotation.'], 422);
        }

        $validated['student_id'] = $user->id;

        $review = PreceptorReview::create($validated);

        return response()->json($review, 201);
    }

    public function index(Request $request, User $preceptor): JsonResponse
    {
        $reviews = PreceptorReview::where('preceptor_id', $preceptor->id)
            ->with(['slot.site'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($review) {
                $data = $review->toArray();
                if ($review->is_anonymous) {
                    unset($data['student_id']);
                    $data['student'] = null;
                } else {
                    $review->load('student');
                    $data['student'] = $review->student ? [
                        'id' => $review->student->id,
                        'first_name' => $review->student->first_name,
                        'last_name' => $review->student->last_name,
                    ] : null;
                }
                return $data;
            });

        return response()->json($reviews);
    }

    public function stats(User $preceptor): JsonResponse
    {
        $reviews = PreceptorReview::where('preceptor_id', $preceptor->id)->get();

        if ($reviews->isEmpty()) {
            return response()->json([
                'average_score' => null,
                'review_count' => 0,
                'category_averages' => null,
            ]);
        }

        $categories = ['teaching_quality', 'communication', 'mentorship', 'professionalism', 'feedback_quality', 'availability', 'clinical_knowledge', 'support'];

        $categoryAverages = [];
        foreach ($categories as $cat) {
            $values = $reviews->map(fn($r) => $r->ratings[$cat] ?? null)->filter()->values();
            $categoryAverages[$cat] = $values->isNotEmpty() ? round($values->avg(), 1) : null;
        }

        return response()->json([
            'average_score' => round($reviews->avg('overall_score'), 1),
            'review_count' => $reviews->count(),
            'category_averages' => $categoryAverages,
        ]);
    }
}
