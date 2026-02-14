<?php

namespace App\Http\Controllers;

use App\Models\AgreementTemplate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AgreementTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = AgreementTemplate::with('university');

        // Coordinators see their university's + global; admin sees all
        if (!$user->isAdmin()) {
            $universityId = $user->studentProfile?->university_id;
            $query->where(function ($q) use ($universityId) {
                $q->whereNull('university_id');
                if ($universityId) {
                    $q->orWhere('university_id', $universityId);
                }
            });
        }

        $templates = $query->orderBy('created_at', 'desc')->get();

        return response()->json($templates);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'university_id' => ['nullable', 'uuid', 'exists:universities,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'default_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $validated['created_by'] = $request->user()->id;

        $template = AgreementTemplate::create($validated);

        return response()->json($template, 201);
    }

    public function update(Request $request, AgreementTemplate $template): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'default_notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $template->update($validated);

        return response()->json($template);
    }

    public function destroy(AgreementTemplate $template): JsonResponse
    {
        if ($template->file_path) {
            Storage::disk('local')->delete($template->file_path);
        }

        $template->delete();

        return response()->json(['message' => 'Template deleted.']);
    }

    public function uploadDocument(Request $request, AgreementTemplate $template): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,doc,docx', 'max:10240'],
        ]);

        // Remove old file
        if ($template->file_path) {
            Storage::disk('local')->delete($template->file_path);
        }

        $file = $request->file('file');
        $path = $file->store('agreement-templates', 'local');

        $template->update([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json($template);
    }

    public function downloadDocument(AgreementTemplate $template): \Symfony\Component\HttpFoundation\BinaryFileResponse|JsonResponse
    {
        if (!$template->file_path || !Storage::disk('local')->exists($template->file_path)) {
            return response()->json(['message' => 'No document found.'], 404);
        }

        return response()->download(
            Storage::disk('local')->path($template->file_path),
            $template->file_name
        );
    }
}
