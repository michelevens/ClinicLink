<?php

namespace App\Http\Controllers;

use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppSettingsController extends Controller
{
    /**
     * Get all settings, optionally filtered by group.
     * GET /admin/settings
     */
    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = AppSetting::query();

        if ($request->filled('group')) {
            $query->where('group', $request->group);
        }

        $settings = $query->orderBy('group')->orderBy('key')->get()->map(fn($s) => [
            'key' => $s->key,
            'value' => $this->castValue($s->value, $s->type),
            'type' => $s->type,
            'group' => $s->group,
            'label' => $s->label,
            'description' => $s->description,
        ]);

        return response()->json(['settings' => $settings]);
    }

    /**
     * Update one or more settings.
     * PUT /admin/settings
     */
    public function update(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*.key' => ['required', 'string'],
            'settings.*.value' => ['present', 'nullable'],
        ]);

        foreach ($validated['settings'] as $item) {
            $setting = AppSetting::find($item['key']);
            if (!$setting) continue;

            // Validate email format for email-type settings
            if (str_contains($item['key'], 'email') && $item['value']) {
                if (!filter_var($item['value'], FILTER_VALIDATE_EMAIL)) {
                    return response()->json([
                        'message' => "Invalid email address for {$setting->label}.",
                    ], 422);
                }
            }

            $value = $item['value'];
            if ($setting->type === 'boolean') {
                $value = $value ? 'true' : 'false';
            }

            $setting->update(['value' => $value]);
            \Illuminate\Support\Facades\Cache::forget("app_setting:{$item['key']}");
        }

        return response()->json(['message' => 'Settings updated successfully.']);
    }

    private function castValue(?string $value, string $type): mixed
    {
        if ($value === null) return null;

        return match ($type) {
            'boolean' => in_array(strtolower($value), ['true', '1', 'yes']),
            'integer' => (int) $value,
            'json' => json_decode($value, true),
            default => $value,
        };
    }
}
