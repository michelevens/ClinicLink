<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 20));

        return response()->json($notifications);
    }

    public function unreadCount(Request $request): JsonResponse
    {
        $count = $request->user()->unreadNotifications()->count();

        return response()->json(['count' => $count]);
    }

    public function markAsRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->firstOrFail();

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read.']);
    }

    public function markAllAsRead(Request $request): JsonResponse
    {
        $request->user()->unreadNotifications->markAsRead();

        return response()->json(['message' => 'All notifications marked as read.']);
    }

    public function getPreferences(Request $request): JsonResponse
    {
        $defaults = [
            'application_updates' => true,
            'hour_log_reviews' => true,
            'evaluations' => true,
            'site_join_requests' => true,
            'reminders' => true,
            'product_updates' => false,
        ];

        return response()->json([
            'preferences' => array_merge($defaults, $request->user()->notification_preferences ?? []),
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_updates' => ['sometimes', 'boolean'],
            'hour_log_reviews' => ['sometimes', 'boolean'],
            'evaluations' => ['sometimes', 'boolean'],
            'site_join_requests' => ['sometimes', 'boolean'],
            'reminders' => ['sometimes', 'boolean'],
            'product_updates' => ['sometimes', 'boolean'],
        ]);

        $current = $request->user()->notification_preferences ?? [];
        $request->user()->update([
            'notification_preferences' => array_merge($current, $validated),
        ]);

        $defaults = [
            'application_updates' => true,
            'hour_log_reviews' => true,
            'evaluations' => true,
            'site_join_requests' => true,
            'reminders' => true,
            'product_updates' => false,
        ];

        return response()->json([
            'preferences' => array_merge($defaults, $request->user()->notification_preferences ?? []),
        ]);
    }
}
