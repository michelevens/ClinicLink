<?php

namespace App\Http\Controllers;

use App\Mail\ApplicationStatusMail;
use App\Models\Application;
use App\Models\OnboardingTask;
use App\Models\RotationSlot;
use App\Models\StudentProfile;
use App\Models\User;
use App\Notifications\ApplicationReviewedNotification;
use App\Notifications\CeCertificateIssuedNotification;
use App\Notifications\NewApplicationNotification;
use App\Notifications\StudentApplicationSubmittedNotification;
use App\Services\CECertificateGenerator;
use App\Services\CEEligibilityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ApplicationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Application::with(['student.studentProfile.university', 'student.studentProfile.program', 'slot.site', 'slot.preceptor', 'reviewer']);

        if ($user->isStudent()) {
            $query->where('student_id', $user->id);
        } elseif ($user->isSiteManager()) {
            $query->whereHas('slot.site', function ($q) use ($user) {
                $q->where('manager_id', $user->id);
            });
        } elseif ($user->isPreceptor()) {
            $query->whereHas('slot', function ($q) use ($user) {
                $q->where('preceptor_id', $user->id);
            });
        } elseif ($user->isCoordinator() || $user->role === 'professor') {
            // Scope to students from the same university
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $studentIds = StudentProfile::where('university_id', $universityId)->pluck('user_id');
                $query->whereIn('student_id', $studentIds);
            }
        }

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        $applications = $query->orderBy('submitted_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($applications);
    }

    public function show(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        if (!$this->canAccessApplication($user, $application)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $application->load(['student.studentProfile.university', 'student.studentProfile.program', 'student.credentials', 'slot.site', 'slot.preceptor', 'reviewer']);

        return response()->json($application);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isStudent()) {
            return response()->json(['message' => 'Only students can create applications.'], 403);
        }

        $validated = $request->validate([
            'slot_id' => ['required', 'uuid', 'exists:rotation_slots,id'],
            'cover_letter' => ['nullable', 'string', 'max:5000'],
        ]);

        $slot = RotationSlot::findOrFail($validated['slot_id']);

        if (!$slot->hasAvailability()) {
            return response()->json(['message' => 'This rotation slot is full.'], 422);
        }

        $existing = Application::where('student_id', $user->id)
            ->where('slot_id', $validated['slot_id'])
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already applied to this slot.'], 422);
        }

        $application = Application::create([
            'student_id' => $user->id,
            'slot_id' => $validated['slot_id'],
            'cover_letter' => $validated['cover_letter'] ?? null,
            'submitted_at' => now(),
        ]);

        $application->load(['student', 'slot.site']);

        // Notify site manager
        if ($slot->site && $slot->site->manager) {
            $slot->site->manager->notify(new NewApplicationNotification($application));
        }

        // Notify coordinator/professor at the student's university
        try {
            $studentUniId = $user->studentProfile?->university_id;
            if ($studentUniId) {
                $facultyUsers = User::whereIn('role', ['coordinator', 'professor'])
                    ->whereHas('studentProfile', fn ($q) => $q->where('university_id', $studentUniId))
                    ->get();
                foreach ($facultyUsers as $faculty) {
                    $faculty->notify(new StudentApplicationSubmittedNotification($application));
                }
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to send application notification to coordinators: ' . $e->getMessage());
        }

        return response()->json($application, 201);
    }

    public function review(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        if (!$this->canReviewApplication($user, $application)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:accepted,declined,waitlisted'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $application->update([
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
            'reviewed_at' => now(),
            'reviewed_by' => $user->id,
        ]);

        if ($validated['status'] === 'accepted') {
            $slot = $application->slot;
            $slot->increment('filled');

            if ($slot->filled >= $slot->capacity) {
                $slot->update(['status' => 'filled']);
            }

            // Auto-create onboarding tasks from site's active template
            $site = $slot->site;
            $template = $site->onboardingTemplates()->where('is_active', true)->latest()->first();
            if ($template) {
                foreach ($template->items()->orderBy('order')->get() as $item) {
                    OnboardingTask::create([
                        'application_id' => $application->id,
                        'item_id' => $item->id,
                        'title' => $item->title,
                        'description' => $item->description,
                        'is_required' => $item->is_required,
                        'order' => $item->order,
                    ]);
                }
            }
        }

        $application->load(['student', 'slot.site']);

        // Email the student about the decision (non-blocking)
        try {
            Mail::to($application->student->email)->send(
                new ApplicationStatusMail($application, $validated['status'])
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to send application status email: ' . $e->getMessage());
        }

        // In-app notification for the student
        try {
            $application->student->notify(new ApplicationReviewedNotification($application, $validated['status']));
        } catch (\Throwable $e) {
            Log::warning('Failed to send application review notification: ' . $e->getMessage());
        }

        return response()->json($application);
    }

    public function withdraw(Request $request, Application $application): JsonResponse
    {
        if ($application->student_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($application->status !== 'pending') {
            return response()->json(['message' => 'Only pending applications can be withdrawn.'], 422);
        }

        $application->update(['status' => 'withdrawn']);

        return response()->json($application);
    }

    public function complete(Request $request, Application $application): JsonResponse
    {
        $user = $request->user();

        // Only site_manager (for the app's site), preceptor (for the slot), coordinator, or admin can mark complete
        if (!$this->canReviewApplication($user, $application)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($application->status !== 'accepted') {
            return response()->json(['message' => 'Only accepted applications can be marked as completed.'], 422);
        }

        $application->update(['status' => 'completed']);

        // Auto-trigger CE eligibility check
        $ceResult = null;
        $eligibilityService = new CEEligibilityService();
        $eligibility = $eligibilityService->check($application);

        if ($eligibility['eligible']) {
            $generator = new CECertificateGenerator();
            $ceCert = $generator->createFromEligibility(
                $application,
                $eligibility,
                null,
                $user->id,
                $user->role,
                $request->ip(),
                substr((string) $request->userAgent(), 0, 500),
            );
            $ceResult = [
                'ce_certificate_created' => true,
                'ce_status' => $ceCert->status,
                'contact_hours' => $ceCert->contact_hours,
            ];

            // Notify the preceptor about their CE certificate
            $application->loadMissing('slot');
            if ($application->slot?->preceptor_id) {
                $preceptor = User::find($application->slot->preceptor_id);
                if ($preceptor) {
                    $ceCert->load(['university', 'application.slot.site', 'application.student']);
                    $preceptor->notify(new CeCertificateIssuedNotification($ceCert));
                }
            }
        } else {
            $ceResult = [
                'ce_certificate_created' => false,
                'ce_reason' => $eligibility['reason'],
            ];
        }

        $application->load(['student', 'slot.site', 'ceCertificate']);

        return response()->json([
            'application' => $application,
            'ce' => $ceResult,
        ]);
    }

    private function canAccessApplication($user, Application $application): bool
    {
        if ($user->isAdmin()) return true;
        if ($application->student_id === $user->id) return true;

        $application->loadMissing('slot.site');
        $slot = $application->slot;

        if ($user->isSiteManager() && $slot->site->manager_id === $user->id) return true;
        if ($user->isPreceptor() && $slot->preceptor_id === $user->id) return true;

        if ($user->isCoordinator() || $user->role === 'professor') {
            $application->loadMissing('student.studentProfile');
            $studentUni = $application->student->studentProfile?->university_id;
            $userUni = $user->studentProfile?->university_id;
            if ($studentUni && $userUni && $studentUni === $userUni) return true;
        }

        return false;
    }

    private function canReviewApplication($user, Application $application): bool
    {
        if ($user->isAdmin()) return true;
        if ($user->isStudent()) return false;

        $application->loadMissing('slot.site');
        $slot = $application->slot;

        if ($user->isSiteManager() && $slot->site->manager_id === $user->id) return true;
        if ($user->isPreceptor() && $slot->preceptor_id === $user->id) return true;
        if ($user->isCoordinator()) {
            $application->loadMissing('student.studentProfile');
            $studentUni = $application->student->studentProfile?->university_id;
            $userUni = $user->studentProfile?->university_id;
            return $studentUni && $userUni && $studentUni === $userUni;
        }

        return false;
    }
}
