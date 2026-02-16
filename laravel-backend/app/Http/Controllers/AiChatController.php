<?php

namespace App\Http\Controllers;

use App\Models\AiChatConversation;
use App\Models\AiChatMessage;
use App\Services\AiChatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class AiChatController extends Controller
{
    public function __construct(private AiChatService $chatService) {}

    /**
     * List user's conversations.
     */
    public function conversations(Request $request): JsonResponse
    {
        $conversations = AiChatConversation::where('user_id', $request->user()->id)
            ->orderByDesc('last_message_at')
            ->limit(50)
            ->get(['id', 'title', 'context_page', 'message_count', 'last_message_at', 'created_at']);

        return response()->json(['conversations' => $conversations]);
    }

    /**
     * Get messages for a conversation.
     */
    public function messages(Request $request, AiChatConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $messages = $conversation->messages()
            ->whereIn('role', ['user', 'assistant'])
            ->orderBy('created_at')
            ->get(['id', 'role', 'content', 'created_at']);

        return response()->json(['messages' => $messages]);
    }

    /**
     * Send a message and get AI response.
     */
    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string|max:2000',
            'conversation_id' => 'nullable|uuid',
            'current_page' => 'nullable|string|max:255',
        ]);

        $user = $request->user();

        // Daily rate limit: 100 for free, 500 for pro
        $dailyLimit = $user->plan === 'pro' ? 500 : 100;
        $todayCount = AiChatMessage::whereHas('conversation', fn ($q) => $q->where('user_id', $user->id))
            ->where('role', 'user')
            ->where('created_at', '>=', now()->startOfDay())
            ->count();

        if ($todayCount >= $dailyLimit) {
            return response()->json([
                'message' => "You've reached your daily limit of {$dailyLimit} messages. " .
                    ($user->plan !== 'pro' ? 'Upgrade to Pro for 500 messages/day.' : 'Your limit resets at midnight.'),
            ], 429);
        }

        // Get or create conversation
        $conversation = null;
        if ($validated['conversation_id'] ?? null) {
            $conversation = AiChatConversation::where('id', $validated['conversation_id'])
                ->where('user_id', $user->id)
                ->first();
        }

        if (!$conversation) {
            $conversation = AiChatConversation::create([
                'user_id' => $user->id,
                'title' => Str::limit($validated['message'], 80),
                'context_page' => $validated['current_page'] ?? null,
                'message_count' => 0,
                'last_message_at' => now(),
            ]);
        }

        // Store user message
        $conversation->messages()->create([
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        // Build system prompt
        $systemPrompt = $this->chatService->buildSystemPrompt($user, $validated['current_page'] ?? $conversation->context_page);

        // Gather last 20 messages as context
        $history = $conversation->messages()
            ->whereIn('role', ['user', 'assistant'])
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->reverse()
            ->values();

        $openaiMessages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        foreach ($history as $msg) {
            $openaiMessages[] = [
                'role' => $msg->role,
                'content' => $msg->content,
            ];
        }

        // Call OpenAI
        $apiKey = config('services.openai.api_key');
        $model = config('services.openai.model', 'gpt-4o-mini');
        $maxTokens = config('services.openai.max_tokens', 1024);

        if (!$apiKey) {
            return response()->json(['message' => 'AI service is not configured.'], 503);
        }

        try {
            $response = Http::withHeaders([
                'Authorization' => "Bearer {$apiKey}",
                'Content-Type' => 'application/json',
            ])->timeout(30)->post('https://api.openai.com/v1/chat/completions', [
                'model' => $model,
                'messages' => $openaiMessages,
                'max_tokens' => $maxTokens,
                'temperature' => 0.7,
            ]);

            if ($response->failed()) {
                $error = $response->json('error.message', 'AI service error');
                return response()->json(['message' => "AI service error: {$error}"], 502);
            }

            $data = $response->json();
            $aiContent = $data['choices'][0]['message']['content'] ?? 'Sorry, I could not generate a response.';
            $tokensUsed = $data['usage']['total_tokens'] ?? null;
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to reach AI service. Please try again.'], 502);
        }

        // Store assistant response
        $assistantMessage = $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $aiContent,
            'tokens_used' => $tokensUsed,
        ]);

        // Update conversation
        $conversation->update([
            'message_count' => $conversation->messages()->count(),
            'last_message_at' => now(),
        ]);

        return response()->json([
            'conversation_id' => $conversation->id,
            'message' => [
                'id' => $assistantMessage->id,
                'role' => 'assistant',
                'content' => $aiContent,
                'created_at' => $assistantMessage->created_at,
            ],
        ]);
    }

    /**
     * Delete a conversation.
     */
    public function deleteConversation(Request $request, AiChatConversation $conversation): JsonResponse
    {
        if ($conversation->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Not found.'], 404);
        }

        $conversation->delete();

        return response()->json(['message' => 'Conversation deleted.']);
    }

    /**
     * Get role + page-aware suggestions.
     */
    public function suggestions(Request $request): JsonResponse
    {
        $user = $request->user();
        $page = $request->query('page', '/dashboard');

        $suggestions = $this->chatService->getSuggestions($user->role, $page);

        return response()->json(['suggestions' => $suggestions]);
    }
}
