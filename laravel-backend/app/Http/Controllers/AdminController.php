<?php

namespace App\Http\Controllers;

use App\Models\Program;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;

class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $query = User::query();

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                  ->orWhere('last_name', 'ilike', "%{$search}%")
                  ->orWhere('email', 'ilike', "%{$search}%")
                  ->orWhere('username', 'ilike', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($users);
    }

    public function showUser(User $user): JsonResponse
    {
        $relations = [];

        switch ($user->role) {
            case 'student':
                $relations = [
                    'studentProfile',
                    'credentials',
                    'applications.slot.site',
                    'hourLogs',
                    'evaluationsAsStudent.slot',
                    'evaluationsAsStudent.preceptor',
                ];
                break;
            case 'preceptor':
                $relations = [
                    'preceptorSlots.site',
                    'evaluationsAsPreceptor.student',
                    'evaluationsAsPreceptor.slot',
                ];
                break;
            case 'site_manager':
                $relations = [
                    'managedSites',
                ];
                break;
        }

        $user->load($relations);

        $stats = [
            'applications_count' => $user->applications()->count(),
            'hour_logs_count' => $user->hourLogs()->count(),
            'total_hours' => (float) $user->hourLogs()->where('status', 'approved')->sum('hours_worked'),
            'evaluations_as_student' => $user->evaluationsAsStudent()->count(),
            'evaluations_as_preceptor' => $user->evaluationsAsPreceptor()->count(),
            'managed_sites_count' => $user->managedSites()->count(),
            'preceptor_slots_count' => $user->preceptorSlots()->count(),
        ];

        return response()->json([
            'user' => $user,
            'stats' => $stats,
        ]);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role' => ['sometimes', 'in:student,preceptor,site_manager,coordinator,professor,admin'],
            'is_active' => ['sometimes', 'boolean'],
        ]);

        $user->update($validated);

        return response()->json(['user' => $user]);
    }

    public function deleteUser(Request $request, User $user): JsonResponse
    {
        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot delete your own account.'], 422);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    public function seedUniversities(Request $request): JsonResponse
    {
        $exitCode = Artisan::call('scrape:universities', [
            '--source' => 'curated',
            '--with-programs' => true,
        ]);

        $output = Artisan::output();

        return response()->json([
            'message' => 'University seeding complete.',
            'exit_code' => $exitCode,
            'output' => $output,
        ]);
    }
}
