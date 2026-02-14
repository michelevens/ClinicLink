<?php

namespace App\Http\Controllers;

use App\Models\RotationSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookmarkController extends Controller
{
    public function toggle(Request $request, RotationSlot $slot): JsonResponse
    {
        $user = $request->user();
        $existing = $user->bookmarkedSlots()->where('slot_id', $slot->id)->exists();

        if ($existing) {
            $user->bookmarkedSlots()->detach($slot->id);
            return response()->json(['bookmarked' => false]);
        }

        $user->bookmarkedSlots()->attach($slot->id);
        return response()->json(['bookmarked' => true]);
    }

    public function index(Request $request): JsonResponse
    {
        $slots = $request->user()
            ->bookmarkedSlots()
            ->with(['site', 'preceptor'])
            ->orderBy('slot_bookmarks.created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($slots);
    }
}
