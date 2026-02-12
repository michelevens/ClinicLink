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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

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

        // Students cannot access this endpoint
        if ($user->isStudent()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

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
        } elseif ($user->isCoordinator() || $user->role === 'professor' || $user->isAdmin()) {
            // Coordinator/Professor: students from same university; Admin: all students
            if ($user->isAdmin()) {
                $students = User::where('role', 'student')
                    ->with(['studentProfile.university', 'studentProfile.program'])
                    ->get();
            } else {
                $universityId = $user->studentProfile?->university_id;
                if ($universityId) {
                    $studentUserIds = StudentProfile::where('university_id', $universityId)->pluck('user_id');
                    $students = User::where('role', 'student')
                        ->whereIn('id', $studentUserIds)
                        ->with(['studentProfile.university', 'studentProfile.program'])
                        ->get();
                } else {
                    $students = collect();
                }
            }
        } else {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Enrich with hour summaries; restrict sensitive fields based on role
        $canSeeSensitive = $user->isCoordinator() || $user->role === 'professor' || $user->isAdmin();

        $result = $students->map(function ($student) use ($canSeeSensitive) {
            $profile = $student->studentProfile;
            $approvedHours = HourLog::where('student_id', $student->id)
                ->where('status', 'approved')
                ->sum('hours_worked');
            $pendingHours = HourLog::where('student_id', $student->id)
                ->where('status', 'pending')
                ->sum('hours_worked');

            $data = [
                'id' => $student->id,
                'first_name' => $student->first_name,
                'last_name' => $student->last_name,
                'email' => $student->email,
                'university' => $profile?->university?->name,
                'program' => $profile?->program?->name,
                'degree_type' => $profile?->program?->degree_type,
                'hours_completed' => (float) $approvedHours,
                'prior_hours' => $profile?->prior_hours ?? 0,
                'total_hours' => ($profile?->prior_hours ?? 0) + (float) $approvedHours,
                'hours_required' => $profile?->program?->required_hours ?? 0,
                'pending_hours' => (float) $pendingHours,
            ];

            // Only coordinators, professors, and admins can see sensitive academic data
            if ($canSeeSensitive) {
                $data['graduation_date'] = $profile?->graduation_date;
                $data['gpa'] = $profile?->gpa;
                $data['bio'] = $profile?->bio;
                $data['clinical_interests'] = $profile?->clinical_interests ?? [];
            }

            return $data;
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

        // Delete associated file if exists
        if ($credential->file_path && Storage::disk()->exists($credential->file_path)) {
            Storage::disk()->delete($credential->file_path);
        }

        $credential->delete();

        return response()->json(['message' => 'Credential deleted successfully.']);
    }

    public function uploadCredentialFile(Request $request, Credential $credential): JsonResponse
    {
        if ($credential->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:20480'],
        ]);

        // Delete old file if exists
        if ($credential->file_path && Storage::disk()->exists($credential->file_path)) {
            Storage::disk()->delete($credential->file_path);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("credentials/{$request->user()->id}", $fileName, config('filesystems.default'));

        $credential->update([
            'file_path' => $path,
            'file_name' => $originalName,
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'credential' => $credential->fresh(),
            'message' => 'Document uploaded successfully.',
        ]);
    }

    public function downloadCredentialFile(Request $request, Credential $credential)
    {
        if ($credential->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!$credential->file_path || !Storage::disk()->exists($credential->file_path)) {
            return response()->json(['message' => 'No file found.'], 404);
        }

        $content = Storage::disk()->get($credential->file_path);
        $mimeType = Storage::disk()->mimeType($credential->file_path) ?? 'application/octet-stream';

        return response($content, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'attachment; filename="' . ($credential->file_name ?? 'document') . '"');
    }

    /**
     * Set prior hours for a student (coordinator/admin only).
     * Prior hours represent clinical hours completed before the school adopted ClinicLink.
     */
    public function setPriorHours(Request $request, User $student): JsonResponse
    {
        $user = $request->user();

        if (!$student->isStudent()) {
            return response()->json(['message' => 'User is not a student.'], 422);
        }

        // Coordinators can only set prior hours for students at their university
        if ($user->isCoordinator()) {
            $coordUniversityId = $user->studentProfile?->university_id;
            $studentUniversityId = $student->studentProfile?->university_id;
            if (!$coordUniversityId || $coordUniversityId !== $studentUniversityId) {
                return response()->json(['message' => 'Student is not at your university.'], 403);
            }
        }

        $validated = $request->validate([
            'prior_hours' => ['required', 'integer', 'min:0'],
        ]);

        $profile = $student->studentProfile;
        if (!$profile) {
            return response()->json(['message' => 'Student has no profile.'], 404);
        }

        $profile->update(['prior_hours' => $validated['prior_hours']]);

        return response()->json([
            'message' => 'Prior hours updated successfully.',
            'student_id' => $student->id,
            'prior_hours' => $profile->prior_hours,
            'total_hours' => $profile->total_hours,
        ]);
    }

    /**
     * Bulk set prior hours for multiple students (coordinator/admin only).
     */
    public function bulkSetPriorHours(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'students' => ['required', 'array', 'min:1'],
            'students.*.student_id' => ['required', 'uuid', 'exists:users,id'],
            'students.*.prior_hours' => ['required', 'integer', 'min:0'],
        ]);

        $coordUniversityId = $user->isCoordinator()
            ? $user->studentProfile?->university_id
            : null;

        $updated = [];
        $errors = [];

        foreach ($validated['students'] as $entry) {
            $student = User::find($entry['student_id']);

            if (!$student || !$student->isStudent()) {
                $errors[] = ['student_id' => $entry['student_id'], 'error' => 'Not a valid student.'];
                continue;
            }

            // Coordinators: verify same university
            if ($coordUniversityId) {
                $studentUniversityId = $student->studentProfile?->university_id;
                if ($coordUniversityId !== $studentUniversityId) {
                    $errors[] = ['student_id' => $entry['student_id'], 'error' => 'Student is not at your university.'];
                    continue;
                }
            }

            $profile = $student->studentProfile;
            if (!$profile) {
                $errors[] = ['student_id' => $entry['student_id'], 'error' => 'Student has no profile.'];
                continue;
            }

            $profile->update(['prior_hours' => $entry['prior_hours']]);
            $updated[] = [
                'student_id' => $student->id,
                'prior_hours' => $entry['prior_hours'],
                'total_hours' => $profile->total_hours,
            ];
        }

        return response()->json([
            'message' => count($updated) . ' student(s) updated.',
            'updated' => $updated,
            'errors' => $errors,
        ]);
    }
}
