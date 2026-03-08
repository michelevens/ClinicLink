<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class AppSetting extends Model
{
    protected $primaryKey = 'key';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['key', 'value', 'type', 'group', 'label', 'description'];

    private const CACHE_TTL = 3600; // 1 hour

    /**
     * Get a setting value by key, with optional default.
     */
    public static function getValue(string $key, mixed $default = null): mixed
    {
        $setting = Cache::remember("app_setting:{$key}", self::CACHE_TTL, function () use ($key) {
            return static::find($key);
        });

        if (!$setting) return $default;

        return self::castValue($setting->value, $setting->type) ?? $default;
    }

    /**
     * Set a setting value by key.
     */
    public static function setValue(string $key, mixed $value): void
    {
        $setting = static::find($key);
        if ($setting) {
            $setting->update(['value' => is_bool($value) ? ($value ? 'true' : 'false') : (string) $value]);
        } else {
            static::create(['key' => $key, 'value' => (string) $value, 'type' => 'string', 'group' => 'general']);
        }

        Cache::forget("app_setting:{$key}");
    }

    /**
     * Get all settings in a group.
     */
    public static function getGroup(string $group): array
    {
        return static::where('group', $group)->get()->map(fn($s) => [
            'key' => $s->key,
            'value' => self::castValue($s->value, $s->type),
            'type' => $s->type,
            'label' => $s->label,
            'description' => $s->description,
            'group' => $s->group,
        ])->keyBy('key')->toArray();
    }

    /**
     * Cast a string value to its proper type.
     */
    private static function castValue(?string $value, string $type): mixed
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
