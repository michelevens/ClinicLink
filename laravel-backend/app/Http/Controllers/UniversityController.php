<?php

namespace App\Http\Controllers;

use App\Models\AffiliationAgreement;
use App\Models\Program;
use App\Models\University;
use App\Models\UniversityLicenseCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UniversityController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'size:2'],
            'zip' => ['nullable', 'string', 'max:10'],
            'phone' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:500'],
            'is_verified' => ['nullable', 'boolean'],
        ]);

        $university = University::create($validated);

        return response()->json($university->load('programs'), 201);
    }

    public function update(Request $request, University $university): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:255'],
            'state' => ['nullable', 'string', 'size:2'],
            'zip' => ['nullable', 'string', 'max:10'],
            'phone' => ['nullable', 'string', 'max:20'],
            'website' => ['nullable', 'url', 'max:500'],
            'is_verified' => ['nullable', 'boolean'],
        ]);

        $university->update($validated);

        return response()->json($university->load('programs'));
    }

    public function destroy(Request $request, University $university): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if ($university->studentProfiles()->exists()) {
            return response()->json(['message' => 'Cannot delete university with enrolled students.'], 422);
        }

        $university->programs()->delete();
        $university->delete();

        return response()->json(['message' => 'University deleted successfully.']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = University::with('programs');

        // Coordinators only see their associated university
        $user = $request->user();
        if ($user && $user->isCoordinator()) {
            $coordUniversityId = $user->studentProfile?->university_id;
            if ($coordUniversityId) {
                $query->where('id', $coordUniversityId);
            } else {
                // Coordinator with no university association sees nothing
                $query->whereRaw('1=0');
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'ilike', "%{$search}%")
                  ->orWhere('city', 'ilike', "%{$search}%")
                  ->orWhere('system_id', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('state')) {
            $query->where('state', $request->input('state'));
        }

        $universities = $query->orderBy('name')
            ->paginate($request->input('per_page', 50));

        return response()->json($universities);
    }

    public function show(University $university): JsonResponse
    {
        $university->load([
            'programs.studentProfiles',
            'affiliationAgreements.site',
            'studentProfiles.user',
            'studentProfiles.program',
            'cePolicy',
            'ceCertificates.preceptor',
        ])->loadCount('studentProfiles');

        $data = $university->toArray();

        // Analytics: program performance, agreement health, student overview
        $data['analytics'] = [
            'program_performance' => $university->programs->map(function ($program) {
                $students = $program->studentProfiles;
                $studentCount = $students->count();
                $avgHours = $studentCount > 0 ? round($students->avg('hours_completed') ?? 0, 1) : 0;
                $requiredHours = $program->required_hours ?: 1;
                $completedCount = $students->filter(fn ($s) => ($s->hours_completed ?? 0) >= $requiredHours)->count();
                $completionRate = $studentCount > 0 ? round(($completedCount / $studentCount) * 100, 1) : 0;

                return [
                    'id' => $program->id,
                    'name' => $program->name,
                    'degree_type' => $program->degree_type,
                    'required_hours' => $program->required_hours,
                    'student_count' => $studentCount,
                    'avg_hours_completed' => $avgHours,
                    'completion_rate' => $completionRate,
                ];
            }),
            'agreement_summary' => [
                'active' => $university->affiliationAgreements->where('status', 'active')->count(),
                'pending' => $university->affiliationAgreements->whereIn('status', ['draft', 'pending_review'])->count(),
                'expiring_soon' => $university->affiliationAgreements->filter(function ($a) {
                    return $a->status === 'active' && $a->end_date && now()->diffInDays($a->end_date, false) <= 30 && now()->diffInDays($a->end_date, false) >= 0;
                })->count(),
                'expired' => $university->affiliationAgreements->whereIn('status', ['expired', 'terminated'])->count(),
            ],
            'student_overview' => [
                'total_enrolled' => $university->student_profiles_count,
                'avg_hours_progress' => $university->studentProfiles->count() > 0
                    ? round($university->studentProfiles->avg('hours_completed') ?? 0, 1)
                    : 0,
                'nearing_completion' => $university->studentProfiles->filter(function ($sp) {
                    $required = $sp->program->required_hours ?? 0;
                    return $required > 0 && ($sp->hours_completed ?? 0) >= ($required * 0.8);
                })->count(),
            ],
        ];

        return response()->json($data);
    }

    public function programs(University $university): JsonResponse
    {
        return response()->json($university->programs);
    }

    public function agreements(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = AffiliationAgreement::with(['university', 'site', 'creator']);

        // Role-based filtering
        if ($user->isCoordinator() || $user->role === 'professor') {
            // Coordinators/professors see agreements for their students' university
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $query->where('university_id', $universityId);
            }
        } elseif ($user->isSiteManager()) {
            // Site managers see agreements for their sites
            $siteIds = $user->managedSites()->pluck('id');
            $query->whereIn('site_id', $siteIds);
        } elseif (!$user->isAdmin()) {
            // Students and preceptors: show agreements relevant to their context
            $universityId = $user->studentProfile?->university_id;
            if ($universityId) {
                $query->where('university_id', $universityId);
            } else {
                // Preceptors: show agreements for sites they're associated with
                $siteIds = $user->preceptorSlots()->with('site')->get()->pluck('site_id')->unique();
                if ($siteIds->isNotEmpty()) {
                    $query->whereIn('site_id', $siteIds);
                } else {
                    $query->whereRaw('1=0'); // No results
                }
            }
        }
        // Admin sees all — no filter

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('university_id')) {
            $query->where('university_id', $request->input('university_id'));
        }

        if ($request->filled('site_id')) {
            $query->where('site_id', $request->input('site_id'));
        }

        $agreements = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['agreements' => $agreements]);
    }

    public function storeAgreement(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only coordinators, site managers, and admins can create agreements
        if (!$user->isCoordinator() && !$user->isSiteManager() && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'university_id' => ['required', 'uuid', 'exists:universities,id'],
            'site_id' => ['required', 'uuid', 'exists:rotation_sites,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'document_url' => ['nullable', 'url', 'max:500'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $validated['created_by'] = $user->id;

        $agreement = AffiliationAgreement::create($validated);

        return response()->json(['agreement' => $agreement->load(['university', 'site', 'creator'])], 201);
    }

    public function updateAgreement(Request $request, AffiliationAgreement $agreement): JsonResponse
    {
        $user = $request->user();

        // Authorization: creator, site manager for the site, or admin
        $isSiteManager = $user->isSiteManager() && $user->managedSites()->where('id', $agreement->site_id)->exists();
        if ($agreement->created_by !== $user->id && !$isSiteManager && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'status' => ['sometimes', 'in:draft,pending_review,active,expired,terminated'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date'],
            'document_url' => ['nullable', 'url', 'max:500'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $agreement->update($validated);

        return response()->json(['agreement' => $agreement->load(['university', 'site', 'creator'])]);
    }

    public function uploadAgreementDocument(Request $request, AffiliationAgreement $agreement): JsonResponse
    {
        $user = $request->user();

        $isSiteManager = $user->isSiteManager() && $user->managedSites()->where('id', $agreement->site_id)->exists();
        if ($agreement->created_by !== $user->id && !$isSiteManager && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:20480'],
        ]);

        // Delete old file if exists
        if ($agreement->file_path && Storage::disk()->exists($agreement->file_path)) {
            Storage::disk()->delete($agreement->file_path);
        }

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("agreements/{$agreement->id}", $fileName, config('filesystems.default'));

        $agreement->update([
            'file_path' => $path,
            'file_name' => $originalName,
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'agreement' => $agreement->fresh()->load(['university', 'site', 'creator']),
            'message' => 'Document uploaded successfully.',
        ]);
    }

    public function downloadAgreementDocument(Request $request, AffiliationAgreement $agreement)
    {
        $user = $request->user();

        // Anyone involved can download: coordinator (university), site manager (site), admin, or creator
        $isSiteManager = $user->isSiteManager() && $user->managedSites()->where('id', $agreement->site_id)->exists();
        $isUniversityCoordinator = $user->isCoordinator() && $user->studentProfile?->university_id === $agreement->university_id;

        if (!$isSiteManager && !$isUniversityCoordinator && $agreement->created_by !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!$agreement->file_path || !Storage::disk()->exists($agreement->file_path)) {
            return response()->json(['message' => 'No file found.'], 404);
        }

        $content = Storage::disk()->get($agreement->file_path);
        $mimeType = Storage::disk()->mimeType($agreement->file_path) ?? 'application/octet-stream';

        return response($content, 200)
            ->header('Content-Type', $mimeType)
            ->header('Content-Disposition', 'attachment; filename="' . ($agreement->file_name ?? 'document') . '"');
    }

    /**
     * Create a new program for a university (coordinator for own university, or admin).
     */
    public function storeProgram(Request $request, University $university): JsonResponse
    {
        $user = $request->user();

        if ($user->isCoordinator()) {
            $coordUniversityId = $user->studentProfile?->university_id;
            if (!$coordUniversityId || $university->id !== $coordUniversityId) {
                return response()->json(['message' => 'You can only add programs to your own university.'], 403);
            }
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'degree_type' => ['required', 'in:BSN,MSN,DNP,PA,NP,DPT,OTD,MSW,PharmD,other'],
            'required_hours' => ['required', 'integer', 'min:0'],
            'specialties' => ['nullable', 'array'],
        ]);

        $validated['university_id'] = $university->id;

        $program = Program::create($validated);

        return response()->json($program, 201);
    }

    /**
     * Update a program's required_hours (coordinator for own university, or admin).
     */
    public function updateProgram(Request $request, Program $program): JsonResponse
    {
        $user = $request->user();

        // Coordinators can only update programs at their university
        if ($user->isCoordinator()) {
            $coordUniversityId = $user->studentProfile?->university_id;
            if (!$coordUniversityId || $program->university_id !== $coordUniversityId) {
                return response()->json(['message' => 'Program is not at your university.'], 403);
            }
        }

        $validated = $request->validate([
            'required_hours' => ['sometimes', 'integer', 'min:0'],
            'name' => ['sometimes', 'string', 'max:255'],
            'specialties' => ['sometimes', 'array'],
        ]);

        $program->update($validated);

        return response()->json($program);
    }

    public function myUniversityLicenseCodes(Request $request): JsonResponse
    {
        $user = $request->user();
        $universityId = $user->university_id;

        if (!$universityId) {
            return response()->json(['message' => 'You are not associated with a university.'], 422);
        }

        $codes = UniversityLicenseCode::where('university_id', $universityId)
            ->withCount('users')
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['codes' => $codes]);
    }
}
