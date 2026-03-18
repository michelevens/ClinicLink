<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PushNotificationService
{
    private const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

    /**
     * Send push notification to a single user.
     */
    public function sendToUser(User $user, string $title, string $body, array $data = []): void
    {
        $tokens = $user->activePushTokens()->pluck('token')->toArray();
        if (empty($tokens)) return;

        $this->sendToTokens($tokens, $title, $body, $data);
    }

    /**
     * Send push notification to multiple users.
     */
    public function sendToUsers(iterable $users, string $title, string $body, array $data = []): void
    {
        $tokens = [];
        foreach ($users as $user) {
            $userTokens = $user->activePushTokens()->pluck('token')->toArray();
            $tokens = array_merge($tokens, $userTokens);
        }
        if (empty($tokens)) return;

        $this->sendToTokens($tokens, $title, $body, $data);
    }

    /**
     * Send push to specific Expo push tokens.
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): void
    {
        // Expo allows up to 100 messages per request
        $chunks = array_chunk($tokens, 100);

        foreach ($chunks as $chunk) {
            $messages = array_map(fn (string $token) => [
                'to' => $token,
                'sound' => 'default',
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'channelId' => 'default',
            ], $chunk);

            try {
                $response = Http::timeout(10)
                    ->withHeaders(['Accept' => 'application/json'])
                    ->post(self::EXPO_PUSH_URL, $messages);

                if ($response->successful()) {
                    $this->handleReceipts($response->json('data', []), $chunk);
                } else {
                    Log::warning('Expo push failed', [
                        'status' => $response->status(),
                        'body' => $response->body(),
                    ]);
                }
            } catch (\Throwable $e) {
                Log::error('Expo push exception', ['error' => $e->getMessage()]);
            }
        }
    }

    /**
     * Handle Expo push receipts — deactivate invalid tokens.
     */
    private function handleReceipts(array $receipts, array $tokens): void
    {
        foreach ($receipts as $i => $receipt) {
            $status = $receipt['status'] ?? 'ok';
            if ($status === 'error') {
                $detail = $receipt['details']['error'] ?? '';
                // DeviceNotRegistered means the token is stale
                if ($detail === 'DeviceNotRegistered' && isset($tokens[$i])) {
                    \App\Models\PushDeviceToken::where('token', $tokens[$i])
                        ->update(['is_active' => false]);
                    Log::info('Deactivated stale push token', ['token' => $tokens[$i]]);
                }
            }
        }
    }
}
