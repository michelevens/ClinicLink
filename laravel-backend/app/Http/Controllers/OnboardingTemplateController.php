<?php

namespace App\Http\Controllers;

use App\Models\OnboardingTemplate;
use App\Models\OnboardingItem;
use App\Models\RotationSite;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingTemplateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $query = OnboardingTemplate::with(['site', 'items', 'creator']);

        if ($user->isSiteManager()) {
            $siteIds = $user->managedSites()->pluck('id');
            $query->whereIn('site_id', $siteIds);
        } elseif (!$user->isAdmin() && !$user->isCoordinator()) {
            return response()->json(['templates' => []]);
        }

        if ($request->filled('site_id')) {
            $query->where('site_id', $request->input('site_id'));
        }

        $templates = $query->orderBy('created_at', 'desc')->get();

        return response()->json(['templates' => $templates]);
    }

    public function show(Request $request, OnboardingTemplate $template): JsonResponse
    {
        $user = $request->user();

        // Authorization: site manager for the template's site, coordinator, or admin
        if (!$user->isAdmin() && !$user->isCoordinator()) {
            if ($user->isSiteManager()) {
                $template->loadMissing('site');
                if ($template->site->manager_id !== $user->id) {
                    return response()->json(['message' => 'Unauthorized.'], 403);
                }
            } else {
                return response()->json(['message' => 'Unauthorized.'], 403);
            }
        }

        $template->load(['site', 'items', 'creator']);

        return response()->json(['template' => $template]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'site_id' => ['required', 'uuid', 'exists:rotation_sites,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.is_required' => ['boolean'],
        ]);

        $user = $request->user();
        $site = RotationSite::findOrFail($validated['site_id']);

        if ($site->manager_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Deactivate other templates for this site if this one is active
        if ($validated['is_active'] ?? true) {
            OnboardingTemplate::where('site_id', $validated['site_id'])
                ->update(['is_active' => false]);
        }

        $template = OnboardingTemplate::create([
            'site_id' => $validated['site_id'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $user->id,
        ]);

        foreach ($validated['items'] as $index => $itemData) {
            OnboardingItem::create([
                'template_id' => $template->id,
                'title' => $itemData['title'],
                'description' => $itemData['description'] ?? null,
                'is_required' => $itemData['is_required'] ?? true,
                'order' => $index + 1,
            ]);
        }

        return response()->json([
            'template' => $template->load(['site', 'items']),
        ], 201);
    }

    public function update(Request $request, OnboardingTemplate $template): JsonResponse
    {
        $user = $request->user();

        if ($template->site->manager_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['boolean'],
            'items' => ['sometimes', 'array', 'min:1'],
            'items.*.title' => ['required', 'string', 'max:255'],
            'items.*.description' => ['nullable', 'string'],
            'items.*.is_required' => ['boolean'],
        ]);

        // If made active, deactivate others
        if (isset($validated['is_active']) && $validated['is_active']) {
            OnboardingTemplate::where('site_id', $template->site_id)
                ->where('id', '!=', $template->id)
                ->update(['is_active' => false]);
        }

        $template->update($validated);

        // Replace items if provided
        if (isset($validated['items'])) {
            $template->items()->delete();

            foreach ($validated['items'] as $index => $itemData) {
                OnboardingItem::create([
                    'template_id' => $template->id,
                    'title' => $itemData['title'],
                    'description' => $itemData['description'] ?? null,
                    'is_required' => $itemData['is_required'] ?? true,
                    'order' => $index + 1,
                ]);
            }
        }

        return response()->json([
            'template' => $template->fresh()->load(['site', 'items']),
        ]);
    }

    public function destroy(Request $request, OnboardingTemplate $template): JsonResponse
    {
        $user = $request->user();

        if ($template->site->manager_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $template->delete();

        return response()->json(['message' => 'Template deleted successfully.']);
    }
}
