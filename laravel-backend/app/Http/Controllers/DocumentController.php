<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Credential;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentController extends Controller
{
    /**
     * List documents visible to the authenticated user.
     * Supports filtering by folder, status, and search.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Document::visibleTo($user)
            ->with(['user:id,first_name,last_name,email', 'uploadedBy:id,first_name,last_name']);

        if ($request->filled('folder')) {
            $query->folder($request->input('folder'));
        }

        if ($request->filled('status')) {
            match ($request->input('status')) {
                'expired' => $query->expired(),
                'expiring_soon' => $query->expiringSoon(),
                'archived' => $query->where('status', 'archived'),
                default => $query->active(),
            };
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'ilike', "%{$search}%")
                  ->orWhere('file_name', 'ilike', "%{$search}%");
            });
        }

        $documents = $query->orderByDesc('created_at')->paginate(25);

        return response()->json($documents);
    }

    /**
     * Get document vault summary — folder counts and expiring alerts.
     */
    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();

        $base = Document::where('user_id', $user->id);

        $folders = [
            'credentials' => (clone $base)->folder('credentials')->active()->count(),
            'onboarding' => (clone $base)->folder('onboarding')->active()->count(),
            'agreements' => (clone $base)->folder('agreements')->active()->count(),
            'general' => (clone $base)->folder('general')->active()->count(),
        ];

        $expiringSoon = (clone $base)->active()->expiringSoon()->count();
        $expired = (clone $base)->where('status', '!=', 'archived')
            ->where(function ($q) {
                $q->where('status', 'expired')
                  ->orWhere(function ($q2) {
                      $q2->whereNotNull('expiration_date')
                         ->where('expiration_date', '<', now()->toDateString());
                  });
            })->count();

        return response()->json([
            'folders' => $folders,
            'total' => array_sum($folders),
            'expiring_soon' => $expiringSoon,
            'expired' => $expired,
        ]);
    }

    /**
     * Upload a new document to the vault.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,doc,docx', 'max:20480'],
            'title' => ['nullable', 'string', 'max:255'],
            'folder' => ['sometimes', 'string', 'in:credentials,onboarding,agreements,general,other'],
            'description' => ['nullable', 'string', 'max:1000'],
            'expiration_date' => ['nullable', 'date', 'after:today'],
            'visibility' => ['sometimes', 'in:private,shared,public'],
            'shared_with' => ['nullable', 'array'],
            'shared_with.*' => ['uuid', 'exists:users,id'],
            'user_id' => ['nullable', 'uuid', 'exists:users,id'],
        ]);

        $file = $request->file('file');
        $originalName = $file->getClientOriginalName();
        $ownerId = $request->input('user_id', $user->id);

        // Only admin/coordinator can upload for another user
        if ($ownerId !== $user->id && !$user->isAdmin() && !$user->isCoordinator()) {
            return response()->json(['message' => 'You cannot upload documents for other users.'], 403);
        }

        $fileName = time() . '_' . Str::slug(pathinfo($originalName, PATHINFO_FILENAME)) . '.' . $file->getClientOriginalExtension();
        $folder = $request->input('folder', 'general');
        $path = $file->storeAs("documents/{$ownerId}/{$folder}", $fileName, config('filesystems.default'));

        $document = Document::create([
            'user_id' => $ownerId,
            'folder' => $folder,
            'title' => $request->input('title', pathinfo($originalName, PATHINFO_FILENAME)),
            'description' => $request->input('description'),
            'file_path' => $path,
            'file_name' => $originalName,
            'file_size' => $file->getSize(),
            'mime_type' => $file->getMimeType() ?? 'application/octet-stream',
            'expiration_date' => $request->input('expiration_date'),
            'status' => 'active',
            'uploaded_by' => $user->id,
            'visibility' => $request->input('visibility', 'private'),
            'shared_with' => $request->input('shared_with'),
        ]);

        AuditLog::recordFromRequest('Document', $document->id, 'uploaded', $request, metadata: [
            'file_name' => $originalName,
            'folder' => $folder,
        ]);

        return response()->json([
            'document' => $document->load(['user:id,first_name,last_name', 'uploadedBy:id,first_name,last_name']),
            'message' => 'Document uploaded successfully.',
        ], 201);
    }

    /**
     * View a single document's metadata.
     */
    public function show(Request $request, Document $document): JsonResponse
    {
        $user = $request->user();

        if (!$this->canAccess($user, $document)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        return response()->json([
            'document' => $document->load(['user:id,first_name,last_name,email', 'uploadedBy:id,first_name,last_name']),
        ]);
    }

    /**
     * Update document metadata (title, description, expiration, visibility, sharing).
     */
    public function update(Request $request, Document $document): JsonResponse
    {
        $user = $request->user();

        if (!$this->canModify($user, $document)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'folder' => ['sometimes', 'string', 'in:credentials,onboarding,agreements,general,other'],
            'expiration_date' => ['nullable', 'date'],
            'visibility' => ['sometimes', 'in:private,shared,public'],
            'shared_with' => ['nullable', 'array'],
            'shared_with.*' => ['uuid', 'exists:users,id'],
            'status' => ['sometimes', 'in:active,archived'],
        ]);

        $document->update($validated);

        return response()->json([
            'document' => $document->fresh(['user:id,first_name,last_name', 'uploadedBy:id,first_name,last_name']),
        ]);
    }

    /**
     * Download a document file.
     */
    public function download(Request $request, Document $document)
    {
        $user = $request->user();
        if (!$user && $request->filled('token')) {
            $token = \Laravel\Sanctum\PersonalAccessToken::findToken($request->input('token'));
            if ($token) {
                $user = $token->tokenable;
            }
        }

        if (!$user) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        if (!$this->canAccess($user, $document)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (!$document->file_path || !Storage::disk()->exists($document->file_path)) {
            return response()->json(['message' => 'File not found.'], 404);
        }

        AuditLog::recordFromRequest('Document', $document->id, 'downloaded', $request, metadata: [
            'file_name' => $document->file_name,
        ]);

        $content = Storage::disk()->get($document->file_path);

        return response($content, 200)
            ->header('Content-Type', $document->mime_type ?? 'application/octet-stream')
            ->header('Content-Disposition', 'attachment; filename="' . ($document->file_name ?? 'document') . '"');
    }

    /**
     * Soft-delete a document.
     */
    public function destroy(Request $request, Document $document): JsonResponse
    {
        $user = $request->user();

        if (!$this->canModify($user, $document)) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Delete the file from storage
        if ($document->file_path && Storage::disk()->exists($document->file_path)) {
            Storage::disk()->delete($document->file_path);
        }

        AuditLog::recordFromRequest('Document', $document->id, 'deleted', $request, metadata: [
            'file_name' => $document->file_name,
        ]);

        $document->delete();

        return response()->json(['message' => 'Document deleted.']);
    }

    /**
     * Sync credentials and other existing files into the document vault.
     * Creates Document records for credentials that don't already have one.
     */
    public function syncCredentials(Request $request): JsonResponse
    {
        $user = $request->user();
        $synced = 0;

        $credentials = Credential::where('user_id', $user->id)
            ->whereNotNull('file_path')
            ->get();

        foreach ($credentials as $credential) {
            $exists = Document::where('documentable_type', Credential::class)
                ->where('documentable_id', $credential->id)
                ->exists();

            if (!$exists) {
                Document::create([
                    'user_id' => $user->id,
                    'documentable_type' => Credential::class,
                    'documentable_id' => $credential->id,
                    'folder' => 'credentials',
                    'title' => $credential->name,
                    'file_path' => $credential->file_path,
                    'file_name' => $credential->file_name ?? $credential->name,
                    'file_size' => $credential->file_size ?? 0,
                    'mime_type' => 'application/octet-stream',
                    'expiration_date' => $credential->expiration_date,
                    'status' => $credential->isExpired() ? 'expired' : 'active',
                    'uploaded_by' => $user->id,
                    'visibility' => 'private',
                ]);
                $synced++;
            }
        }

        return response()->json([
            'message' => "Synced {$synced} credential(s) to your document vault.",
            'synced' => $synced,
        ]);
    }

    private function canAccess($user, Document $document): bool
    {
        if ($user->isAdmin()) return true;
        if ($document->user_id === $user->id) return true;
        if ($document->visibility === 'public') return true;
        if ($document->visibility === 'shared' && is_array($document->shared_with) && in_array($user->id, $document->shared_with)) return true;
        return false;
    }

    private function canModify($user, Document $document): bool
    {
        if ($user->isAdmin()) return true;
        if ($document->user_id === $user->id) return true;
        if ($document->uploaded_by === $user->id) return true;
        return false;
    }
}
