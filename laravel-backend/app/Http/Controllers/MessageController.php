<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Models\AffiliationAgreement;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use App\Models\RotationSlot;
use App\Models\User;
use App\Notifications\NewMessageNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * List conversations for the authenticated user.
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();

        $conversations = Conversation::whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->with([
                'latestMessage.sender:id,first_name,last_name',
                'users:id,first_name,last_name,role,avatar_url',
            ])
            ->withCount([
                'messages as unread_count' => function ($q) use ($user) {
                    $q->where('sender_id', '!=', $user->id)
                        ->where('created_at', '>', function ($sub) use ($user) {
                            $sub->select('last_read_at')
                                ->from('conversation_participants')
                                ->whereColumn('conversation_id', 'messages.conversation_id')
                                ->where('user_id', $user->id)
                                ->limit(1);
                        });
                },
            ])
            ->orderByDesc(
                Message::select('created_at')
                    ->whereColumn('conversation_id', 'conversations.id')
                    ->latest()
                    ->limit(1)
            )
            ->paginate($request->input('per_page', 20));

        return response()->json($conversations);
    }

    /**
     * Get messages for a conversation + mark as read.
     */
    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        // Verify participant
        $participant = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->first();

        if (!$participant) {
            return response()->json(['message' => 'You are not a participant in this conversation.'], 403);
        }

        // Mark as read
        $participant->update(['last_read_at' => now()]);

        $messages = $conversation->messages()
            ->with('sender:id,first_name,last_name,role,avatar_url')
            ->orderBy('created_at', 'asc')
            ->paginate($request->input('per_page', 50));

        return response()->json([
            'messages' => $messages,
            'conversation' => $conversation->load('users:id,first_name,last_name,role,avatar_url'),
        ]);
    }

    /**
     * Send a message in an existing conversation.
     */
    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();

        // Verify participant
        $isParticipant = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->exists();

        if (!$isParticipant) {
            return response()->json(['message' => 'You are not a participant in this conversation.'], 403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $validated['body'],
        ]);

        $message->load('sender:id,first_name,last_name,role,avatar_url');

        // Mark sender's conversation as read
        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        // Notify other participants
        $otherParticipantIds = ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $user->id)
            ->pluck('user_id');

        $otherUsers = User::whereIn('id', $otherParticipantIds)->get();
        foreach ($otherUsers as $otherUser) {
            $otherUser->notify(new NewMessageNotification($message, $user));
        }

        return response()->json($message, 201);
    }

    /**
     * Create a new conversation (or find existing 1-on-1).
     */
    public function createConversation(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'user_id' => ['required', 'uuid', 'exists:users,id'],
            'body' => ['required', 'string', 'max:5000'],
        ]);

        $targetUser = User::findOrFail($validated['user_id']);

        if ($targetUser->id === $user->id) {
            return response()->json(['message' => 'You cannot message yourself.'], 422);
        }

        // Check authorization
        if (!$this->canMessage($user, $targetUser)) {
            return response()->json(['message' => 'You are not authorized to message this user.'], 403);
        }

        // Find existing 1-on-1 conversation
        $existing = Conversation::where('is_group', false)
            ->whereHas('participants', fn ($q) => $q->where('user_id', $user->id))
            ->whereHas('participants', fn ($q) => $q->where('user_id', $targetUser->id))
            ->withCount('participants')
            ->having('participants_count', 2)
            ->first();

        if ($existing) {
            $conversation = $existing;
        } else {
            $conversation = Conversation::create(['is_group' => false]);
            ConversationParticipant::create(['conversation_id' => $conversation->id, 'user_id' => $user->id]);
            ConversationParticipant::create(['conversation_id' => $conversation->id, 'user_id' => $targetUser->id]);
        }

        // Send the initial message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $validated['body'],
        ]);

        // Mark sender as read
        ConversationParticipant::where('conversation_id', $conversation->id)
            ->where('user_id', $user->id)
            ->update(['last_read_at' => now()]);

        // Notify target user
        $targetUser->notify(new NewMessageNotification($message, $user));

        $conversation->load('users:id,first_name,last_name,role,avatar_url');

        return response()->json([
            'conversation' => $conversation,
            'message' => $message->load('sender:id,first_name,last_name,role,avatar_url'),
        ], 201);
    }

    /**
     * Get total unread message count across all conversations.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $user = $request->user();

        $count = Message::whereIn('conversation_id',
                ConversationParticipant::where('user_id', $user->id)->pluck('conversation_id')
            )
            ->where('sender_id', '!=', $user->id)
            ->where(function ($q) use ($user) {
                $q->whereRaw('created_at > COALESCE((SELECT last_read_at FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = ?), \'1970-01-01\')', [$user->id]);
            })
            ->count();

        return response()->json(['count' => $count]);
    }

    /**
     * Search for users the authenticated user can message.
     */
    public function searchUsers(Request $request): JsonResponse
    {
        $user = $request->user();
        $search = $request->input('search', '');

        $messageableIds = $this->getMessageableUserIds($user);

        $query = User::whereIn('id', $messageableIds)
            ->where('id', '!=', $user->id)
            ->where('is_active', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'ilike', "%{$search}%")
                    ->orWhere('last_name', 'ilike', "%{$search}%")
                    ->orWhere('email', 'ilike', "%{$search}%");
            });
        }

        $users = $query->select('id', 'first_name', 'last_name', 'role', 'avatar_url')
            ->limit(20)
            ->get();

        return response()->json($users);
    }

    /**
     * Send a broadcast announcement (coordinator/admin only).
     */
    public function broadcast(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string', 'max:10000'],
            'audience' => ['required', 'in:all_students,program,role'],
            'program_id' => ['required_if:audience,program', 'nullable', 'uuid', 'exists:programs,id'],
            'role' => ['required_if:audience,role', 'nullable', 'in:student,preceptor,site_manager,coordinator,professor'],
        ]);

        // Resolve audience
        $recipientIds = $this->resolveAudienceIds($user, $validated);

        if ($recipientIds->isEmpty()) {
            return response()->json(['message' => 'No recipients found for the selected audience.'], 422);
        }

        // Create broadcast conversation
        $conversation = Conversation::create([
            'subject' => $validated['subject'],
            'is_group' => true,
            'is_broadcast' => true,
            'broadcast_by' => $user->id,
        ]);

        // Add sender as participant
        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'user_id' => $user->id,
            'last_read_at' => now(),
        ]);

        // Add recipients (chunked for large audiences)
        foreach ($recipientIds->chunk(100) as $chunk) {
            $rows = $chunk->map(fn ($id) => [
                'id' => \Illuminate\Support\Str::uuid(),
                'conversation_id' => $conversation->id,
                'user_id' => $id,
                'created_at' => now(),
                'updated_at' => now(),
            ])->toArray();
            ConversationParticipant::insert($rows);
        }

        // Create the initial message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'body' => $validated['body'],
        ]);

        // Notify recipients (chunked)
        foreach ($recipientIds->chunk(50) as $chunk) {
            $recipients = User::whereIn('id', $chunk)->get();
            foreach ($recipients as $recipient) {
                $recipient->notify(new NewMessageNotification($message, $user));
            }
        }

        $conversation->load('users:id,first_name,last_name,role,avatar_url');

        return response()->json([
            'conversation' => $conversation,
            'message' => $message->load('sender:id,first_name,last_name,role,avatar_url'),
            'recipients_count' => $recipientIds->count(),
        ], 201);
    }

    /**
     * Resolve recipient IDs based on audience type and user scope.
     */
    private function resolveAudienceIds(User $user, array $validated): \Illuminate\Support\Collection
    {
        $audience = $validated['audience'];

        if ($user->isAdmin()) {
            return match ($audience) {
                'all_students' => User::where('role', 'student')->where('is_active', true)->pluck('id'),
                'program' => User::where('role', 'student')->where('is_active', true)
                    ->whereHas('studentProfile', fn ($q) => $q->where('program_id', $validated['program_id']))
                    ->pluck('id'),
                'role' => User::where('role', $validated['role'])->where('is_active', true)
                    ->where('id', '!=', $user->id)->pluck('id'),
                default => collect(),
            };
        }

        // Coordinator: scoped to their university
        $universityId = $user->studentProfile?->university_id;
        if (!$universityId) return collect();

        $baseQuery = User::where('role', 'student')
            ->where('is_active', true)
            ->whereHas('studentProfile', fn ($q) => $q->where('university_id', $universityId));

        return match ($audience) {
            'all_students' => $baseQuery->pluck('id'),
            'program' => $baseQuery->whereHas('studentProfile', fn ($q) => $q->where('program_id', $validated['program_id']))
                ->pluck('id'),
            default => collect(),
        };
    }

    /**
     * Check if a user can message another user.
     */
    private function canMessage(User $sender, User $target): bool
    {
        // Admin can message anyone
        if ($sender->isAdmin()) {
            return true;
        }

        $messageableIds = $this->getMessageableUserIds($sender);
        return $messageableIds->contains($target->id);
    }

    /**
     * Get all user IDs that a given user is authorized to message.
     */
    private function getMessageableUserIds(User $user): \Illuminate\Support\Collection
    {
        return match ($user->role) {
            'student' => $this->studentMessageableIds($user),
            'preceptor' => $this->preceptorMessageableIds($user),
            'site_manager' => $this->siteManagerMessageableIds($user),
            'coordinator', 'professor' => $this->coordinatorMessageableIds($user),
            'admin' => User::where('id', '!=', $user->id)->pluck('id'),
            default => collect(),
        };
    }

    private function studentMessageableIds(User $user): \Illuminate\Support\Collection
    {
        $ids = collect();

        // Preceptors and site managers from accepted rotations
        $acceptedSlotIds = Application::where('student_id', $user->id)
            ->accepted()
            ->pluck('slot_id');

        $slots = RotationSlot::whereIn('id', $acceptedSlotIds)->with('site')->get();

        // Preceptors assigned to those slots
        $ids = $ids->merge($slots->pluck('preceptor_id')->filter());

        // Site managers of those sites
        $ids = $ids->merge($slots->pluck('site.manager_id')->filter());

        // Coordinators/professors from student's university
        $universityId = $user->studentProfile?->university_id;
        if ($universityId) {
            $uniUserIds = User::whereIn('role', ['coordinator', 'professor'])
                ->whereHas('studentProfile', fn ($q) => $q->where('university_id', $universityId))
                ->pluck('id');
            $ids = $ids->merge($uniUserIds);
        }

        return $ids->unique()->values();
    }

    private function preceptorMessageableIds(User $user): \Illuminate\Support\Collection
    {
        $ids = collect();

        // Students in their slots
        $slotIds = $user->preceptorSlots()->pluck('id');
        $studentIds = Application::whereIn('slot_id', $slotIds)->accepted()->pluck('student_id');
        $ids = $ids->merge($studentIds);

        // Site managers of their sites
        $siteIds = RotationSlot::whereIn('id', $slotIds)->pluck('site_id')->unique();
        $managerIds = \App\Models\RotationSite::whereIn('id', $siteIds)->pluck('manager_id')->filter();
        $ids = $ids->merge($managerIds);

        return $ids->unique()->values();
    }

    private function siteManagerMessageableIds(User $user): \Illuminate\Support\Collection
    {
        $ids = collect();
        $siteIds = $user->managedSites()->pluck('id');
        $slotIds = RotationSlot::whereIn('site_id', $siteIds)->pluck('id');

        // Preceptors at their sites
        $preceptorIds = RotationSlot::whereIn('site_id', $siteIds)->pluck('preceptor_id')->filter()->unique();
        $ids = $ids->merge($preceptorIds);

        // Students with accepted applications at their sites
        $studentIds = Application::whereIn('slot_id', $slotIds)->accepted()->pluck('student_id');
        $ids = $ids->merge($studentIds);

        // Coordinators from universities with affiliation agreements
        $universityIds = AffiliationAgreement::whereIn('site_id', $siteIds)
            ->where('status', 'active')
            ->pluck('university_id')
            ->unique();

        $coordinatorIds = User::whereIn('role', ['coordinator', 'professor'])
            ->whereHas('studentProfile', fn ($q) => $q->whereIn('university_id', $universityIds))
            ->pluck('id');
        $ids = $ids->merge($coordinatorIds);

        return $ids->unique()->values();
    }

    private function coordinatorMessageableIds(User $user): \Illuminate\Support\Collection
    {
        $ids = collect();
        $universityId = $user->studentProfile?->university_id;

        if (!$universityId) {
            return $ids;
        }

        // Students at their university
        $studentIds = User::where('role', 'student')
            ->whereHas('studentProfile', fn ($q) => $q->where('university_id', $universityId))
            ->pluck('id');
        $ids = $ids->merge($studentIds);

        // Site managers with affiliation agreements
        $siteIds = AffiliationAgreement::where('university_id', $universityId)
            ->where('status', 'active')
            ->pluck('site_id')
            ->unique();

        $managerIds = \App\Models\RotationSite::whereIn('id', $siteIds)->pluck('manager_id')->filter();
        $ids = $ids->merge($managerIds);

        return $ids->unique()->values();
    }
}
