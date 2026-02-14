<?php

namespace App\Http\Controllers;

use App\Models\AccreditationReport;
use App\Models\Application;
use App\Models\Evaluation;
use App\Models\HourLog;
use App\Models\RotationSlot;
use App\Models\University;
use App\Models\User;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AccreditationReportController extends Controller
{
    /**
     * List generated reports.
     */
    public function index(Request $request): JsonResponse
    {
        $query = AccreditationReport::with('generatedBy:id,first_name,last_name');

        if ($universityId = $request->query('university_id')) {
            $query->where('university_id', $universityId);
        }

        // Coordinators can only see their university's reports
        $user = $request->user();
        if ($user->role === 'coordinator') {
            $uniId = $user->studentProfile?->university_id;
            if ($uniId) {
                $query->where('university_id', $uniId);
            }
        }

        $reports = $query->orderBy('created_at', 'desc')->paginate(15);

        return response()->json($reports);
    }

    /**
     * Generate a new report.
     */
    public function generate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'report_type' => ['required', 'in:annual_summary,program_review,site_evaluation,student_outcomes,clinical_hours'],
            'title' => ['required', 'string', 'max:255'],
            'university_id' => ['required', 'uuid', 'exists:universities,id'],
            'date_from' => ['required', 'date'],
            'date_to' => ['required', 'date', 'after_or_equal:date_from'],
            'program_id' => ['sometimes', 'nullable', 'uuid'],
            'site_id' => ['sometimes', 'nullable', 'uuid'],
        ]);

        $user = $request->user();
        $university = University::findOrFail($validated['university_id']);

        // Create report record
        $report = AccreditationReport::create([
            'university_id' => $validated['university_id'],
            'generated_by' => $user->id,
            'report_type' => $validated['report_type'],
            'title' => $validated['title'],
            'parameters' => [
                'date_from' => $validated['date_from'],
                'date_to' => $validated['date_to'],
                'program_id' => $validated['program_id'] ?? null,
                'site_id' => $validated['site_id'] ?? null,
            ],
            'status' => 'generating',
        ]);

        try {
            $data = $this->compileReportData($report);

            $pdf = Pdf::loadView('reports.accreditation', [
                'report' => $report,
                'university' => $university,
                'data' => $data,
            ]);

            $fileName = Str::slug($report->title) . '-' . now()->format('Y-m-d') . '.pdf';
            $filePath = 'reports/' . $report->id . '/' . $fileName;

            Storage::disk('local')->put($filePath, $pdf->output());

            $report->update([
                'file_path' => $filePath,
                'file_name' => $fileName,
                'file_size' => Storage::disk('local')->size($filePath),
                'status' => 'completed',
                'generated_at' => now(),
            ]);

            return response()->json($report->fresh(), 201);
        } catch (\Exception $e) {
            $report->update(['status' => 'failed']);
            return response()->json(['message' => 'Report generation failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Preview report data without generating PDF.
     */
    public function preview(AccreditationReport $report): JsonResponse
    {
        $data = $this->compileReportData($report);

        return response()->json([
            'report' => $report,
            'data' => $data,
        ]);
    }

    /**
     * Download report PDF.
     */
    public function download(Request $request, AccreditationReport $report)
    {
        if (!$report->file_path || !Storage::disk('local')->exists($report->file_path)) {
            return response()->json(['message' => 'File not found'], 404);
        }

        return Storage::disk('local')->download($report->file_path, $report->file_name);
    }

    /**
     * Delete a report.
     */
    public function destroy(AccreditationReport $report): JsonResponse
    {
        if ($report->file_path) {
            Storage::disk('local')->delete($report->file_path);
        }

        $report->delete();

        return response()->json(['message' => 'Report deleted']);
    }

    /**
     * Compile data for the report based on its type.
     */
    private function compileReportData(AccreditationReport $report): array
    {
        $params = $report->parameters ?? [];
        $from = $params['date_from'] ?? now()->subYear()->toDateString();
        $to = $params['date_to'] ?? now()->toDateString();
        $universityId = $report->university_id;

        $studentIds = User::where('role', 'student')
            ->whereHas('studentProfile', fn($q) => $q->where('university_id', $universityId))
            ->pluck('id');

        switch ($report->report_type) {
            case 'annual_summary':
                return $this->annualSummaryData($studentIds, $from, $to);

            case 'program_review':
                return $this->programReviewData($studentIds, $from, $to, $params['program_id'] ?? null);

            case 'site_evaluation':
                return $this->siteEvaluationData($from, $to, $params['site_id'] ?? null);

            case 'student_outcomes':
                return $this->studentOutcomesData($studentIds, $from, $to);

            case 'clinical_hours':
                return $this->clinicalHoursData($studentIds, $from, $to);

            default:
                return [];
        }
    }

    private function annualSummaryData($studentIds, string $from, string $to): array
    {
        $totalStudents = $studentIds->count();
        $placedStudents = Application::whereIn('student_id', $studentIds)
            ->whereIn('status', ['accepted', 'completed'])
            ->distinct('student_id')
            ->count('student_id');

        $completedPlacements = Application::whereIn('student_id', $studentIds)
            ->where('status', 'completed')
            ->whereBetween('reviewed_at', [$from, $to])
            ->count();

        $totalHours = HourLog::whereIn('student_id', $studentIds)
            ->where('status', 'approved')
            ->whereBetween('date', [$from, $to])
            ->sum('hours');

        $siteCount = Application::whereIn('student_id', $studentIds)
            ->whereIn('status', ['accepted', 'completed'])
            ->join('rotation_slots', 'applications.slot_id', '=', 'rotation_slots.id')
            ->distinct('rotation_slots.site_id')
            ->count('rotation_slots.site_id');

        return [
            'total_students' => $totalStudents,
            'placed_students' => $placedStudents,
            'placement_rate' => $totalStudents > 0 ? round(($placedStudents / $totalStudents) * 100, 1) : 0,
            'completed_placements' => $completedPlacements,
            'total_hours' => round($totalHours, 1),
            'avg_hours_per_student' => $totalStudents > 0 ? round($totalHours / $totalStudents, 1) : 0,
            'sites_used' => $siteCount,
        ];
    }

    private function programReviewData($studentIds, string $from, string $to, ?string $programId): array
    {
        $base = $this->annualSummaryData($studentIds, $from, $to);

        // Per-specialty breakdown
        $specialtyBreakdown = Application::whereIn('student_id', $studentIds)
            ->whereIn('status', ['accepted', 'completed'])
            ->join('rotation_slots', 'applications.slot_id', '=', 'rotation_slots.id')
            ->selectRaw('rotation_slots.specialty, COUNT(*) as count')
            ->groupBy('rotation_slots.specialty')
            ->orderByDesc('count')
            ->get()
            ->toArray();

        $base['specialty_breakdown'] = $specialtyBreakdown;
        return $base;
    }

    private function siteEvaluationData(string $from, string $to, ?string $siteId): array
    {
        $query = RotationSlot::with('site');
        if ($siteId) {
            $query->where('site_id', $siteId);
        }

        $slots = $query->get();
        $slotIds = $slots->pluck('id');

        $totalApps = Application::whereIn('slot_id', $slotIds)
            ->whereBetween('created_at', [$from, $to])
            ->count();

        $accepted = Application::whereIn('slot_id', $slotIds)
            ->where('status', 'accepted')
            ->count();

        $totalHours = HourLog::whereIn('slot_id', $slotIds)
            ->where('status', 'approved')
            ->whereBetween('date', [$from, $to])
            ->sum('hours');

        $capacity = $slots->sum('capacity');
        $filled = $slots->sum('filled');

        return [
            'total_applications' => $totalApps,
            'accepted' => $accepted,
            'total_hours' => round($totalHours, 1),
            'capacity' => $capacity,
            'filled' => $filled,
            'fill_rate' => $capacity > 0 ? round(($filled / $capacity) * 100, 1) : 0,
        ];
    }

    private function studentOutcomesData($studentIds, string $from, string $to): array
    {
        $students = User::whereIn('id', $studentIds)
            ->with('studentProfile')
            ->get();

        $studentData = $students->map(function ($student) use ($from, $to) {
            $hours = HourLog::where('student_id', $student->id)
                ->where('status', 'approved')
                ->whereBetween('date', [$from, $to])
                ->sum('hours');

            $placements = Application::where('student_id', $student->id)
                ->whereIn('status', ['accepted', 'completed'])
                ->count();

            return [
                'name' => $student->full_name,
                'hours_completed' => round($hours, 1),
                'placements' => $placements,
            ];
        });

        return [
            'students' => $studentData->sortByDesc('hours_completed')->values()->toArray(),
            'total_students' => $studentIds->count(),
            'avg_hours' => $studentIds->count() > 0 ? round($studentData->avg('hours_completed'), 1) : 0,
        ];
    }

    private function clinicalHoursData($studentIds, string $from, string $to): array
    {
        $logs = HourLog::whereIn('student_id', $studentIds)
            ->where('status', 'approved')
            ->whereBetween('date', [$from, $to])
            ->with(['student:id,first_name,last_name', 'slot.site:id,name'])
            ->get();

        $bySite = $logs->groupBy(fn($log) => $log->slot?->site?->name ?? 'Unknown')
            ->map(fn($group) => round($group->sum('hours'), 1))
            ->sortDesc()
            ->toArray();

        $byStudent = $logs->groupBy('student_id')
            ->map(function ($group) {
                $student = $group->first()->student;
                return [
                    'name' => $student ? $student->full_name : 'Unknown',
                    'hours' => round($group->sum('hours'), 1),
                    'entries' => $group->count(),
                ];
            })
            ->sortByDesc('hours')
            ->values()
            ->toArray();

        return [
            'total_hours' => round($logs->sum('hours'), 1),
            'total_entries' => $logs->count(),
            'by_site' => $bySite,
            'by_student' => $byStudent,
        ];
    }
}
