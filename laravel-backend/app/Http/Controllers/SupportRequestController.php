<?php

namespace App\Http\Controllers;

use App\Models\SupportRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupportRequestController extends Controller
{
    /** Submit a new support/help request */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string|max:5000',
            'category' => 'sometimes|string|in:general,technical,billing,feature_request',
            'current_page' => 'nullable|string|max:255',
            'ai_chat_conversation_id' => 'nullable|uuid|exists:ai_chat_conversations,id',
        ]);

        $supportRequest = SupportRequest::create([
            'user_id' => $request->user()->id,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Support request submitted successfully. Our team will get back to you soon.',
            'support_request' => $supportRequest,
        ], 201);
    }

    /** List current user's support requests */
    public function index(Request $request): JsonResponse
    {
        $requests = SupportRequest::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->limit(20)
            ->get();

        return response()->json(['support_requests' => $requests]);
    }
}
