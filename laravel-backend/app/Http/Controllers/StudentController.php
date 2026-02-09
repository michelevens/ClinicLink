<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\Credential;
use App\Models\HourLog;
use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentController extends Controller
{
    /**
     * Get students associated with the current user (preceptor, coordinator, professor).
     * Preceptor: students with accepted apps for their slots
     * Coordinator/Professor/Admin: all students with profiles
     */
    public function myStudents(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isPreceptor()) {
            // Students with accepted applications for this preceptor's slots
            $slotIds = $user->preceptorSlots()->pluck('id');
            $studentIds = Application::whereIn('slot_id', $slotIds)
                ->where('status', 'accepted')
                ->pluck('student_id')
                ->unique();

            $students = User::whereIn('id', $studentIds)
                ->with(['studentProfile.university', 'studentProfile.program'])
                ->get();
        } elseif ($user->isSiteManager()) {
            // Students with accepted applications at this manager's sites
            $siteIds = $user->managedSites()->pluck('id');
            $slotIds = DB::table('rotation_slots')->whereIn('site_id', $siteIds)->pluck('id');
            $studentIds = Application::whereIn('slot_id', $slotIds)
                ->where('status', 'accepted')
                ->pluck('student_id')
                ->unique();

            $students = User::whereIn('id', $studentIds)
                ->with(['studentProfile.university', 'studentProfile.program'])
                ->get();
        } else {
            // Coordinator, Professor, Admin: all students
            $students = User::where('role', 'student')
                ->with(['studentProfile.university', 'studentProfile.program'])
                ->get();
        }

        // Enrich with hour summaries and latest evaluation for each student
        $result = $students->map(function ($student) {
            $profile = $student->studentProfile;
            $approvedHours = HourLog::where('student_id', $student->id)
                ->where('status', 'approved')
                ->sum('hours_worked');
            $pendingHours = HourLog::where('student_id', $student->id)
                ->where('status', 'pending')
                ->sum('hours_worked');

            return [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'university' => $profile?->university?->name,
                'program' => $profile?->program?->name,
                'degree_type' => $profile?->program?->degree_type,
                'graduation_date' => $profile?->graduation_date,
                'gpa' => $profile?->gpa,
                'hours_completed' => (float) $approvedHours,
                'hours_required' => $profile?->hours_required ?? 0,
                'pending_hours' => (float) $pendingHours,
                'bio' => $profile?->bio,
                'clinical_interests' => $profile?->clinical_interests ?? [],
            ];
        });

        return response()->json(['students' => $result]);
    }

    public function profile(Request $request): JsonResponse
    {
        $profile = $request->user()->studentProfile;

        if (!$profile) {
            return response()->json(['message' => 'No student profile found.'], 404);
        }

        $profile->load(['university', 'program']);

        return response()->json($profile);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'university_id' => ['nullable', 'uuid', 'exists:universities,id'],
            'program_id' => ['nullable', 'uuid', 'exists:programs,id'],
            'graduation_date' => ['nullable', 'date'],
            'gpa' => ['nullable', 'numeric', 'min:0', 'max:4.00'],
            'clinical_interests' => ['nullable', 'array'],
            'hours_required' => ['sometimes', 'integer', 'min:0'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'resume_url' => ['nullable', 'url', 'max:500'],
        ]);

        $profile = StudentProfile::updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return response()->json($profile->load(['university', 'program']));
    }

    public function credentials(Request $request): JsonResponse
    {
        $credentials = $request->user()->credentials()
            ->orderBy('expiration_date', 'asc')
            ->get();

        return response()->json($credentials);
    }

    public function storeCredential(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:cpr,background_check,immunization,liability_insurance,drug_screen,license,hipaa,other'],
            'name' => ['required', 'string', 'max:255'],
            'expiration_date' => ['nullable', 'date'],
            'document_url' => ['nullable', 'url', 'max:500'],
        ]);

        $validated['user_id'] = $request->user()->id;

        $credential = Credential::create($validated);

        return response()->json($credential, 201);
    }

    public function updateCredential(Request $request, Credential $credential): JsonResponse
    {
        if ($credential->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'expiration_date' => ['nullable', 'date'],
            'status' => ['sometimes', 'in:valid,expiring_soon,expired,pending'],
            'document_url' => ['nullable', 'url', 'max:500'],
        ]);

        $credential->update($validated);

        return response()->json($credential);
    }

    public function deleteCredential(Request $request, Credential $credential): JsonResponse
    {
        if ($credential->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $credential->delete();

        return response()->json(['message' => 'Credential deleted successfully.']);
    }
}
