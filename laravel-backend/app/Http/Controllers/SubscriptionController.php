<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Stripe\Stripe;
use Stripe\Checkout\Session as StripeSession;
use Stripe\Customer;
use Stripe\Webhook;
use Stripe\Subscription;

class SubscriptionController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Get the current user's plan status.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'plan' => $user->plan ?? 'free',
            'trial_ends_at' => $user->trial_ends_at,
            'trial_active' => $user->trial_ends_at && $user->trial_ends_at->isFuture(),
            'trial_days_remaining' => $user->trial_ends_at ? max(0, now()->diffInDays($user->trial_ends_at, false)) : null,
            'free_rotations_used' => $user->free_rotations_used ?? 0,
            'free_rotations_limit' => 1,
            'needs_upgrade' => $user->needsUpgrade(),
            'subscription_status' => $user->subscription_status,
            'subscription_ends_at' => $user->subscription_ends_at,
        ]);
    }

    /**
     * Create a Stripe Checkout session for a student subscription.
     */
    public function createCheckout(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isStudent()) {
            return response()->json(['message' => 'Subscriptions are currently available for students.'], 422);
        }

        $validated = $request->validate([
            'plan' => ['required', 'in:pro'],
            'interval' => ['sometimes', 'in:month,year'],
        ]);

        $interval = $validated['interval'] ?? 'month';

        // Get or create Stripe customer
        if (!$user->stripe_customer_id) {
            $customer = Customer::create([
                'email' => $user->email,
                'name' => $user->full_name,
                'metadata' => ['cliniclink_user_id' => $user->id],
            ]);
            $user->update(['stripe_customer_id' => $customer->id]);
        }

        $priceId = $interval === 'year'
            ? config('services.stripe.prices.student_pro_yearly')
            : config('services.stripe.prices.student_pro_monthly');

        if (!$priceId) {
            return response()->json(['message' => 'Subscription pricing not configured.'], 500);
        }

        $session = StripeSession::create([
            'customer' => $user->stripe_customer_id,
            'mode' => 'subscription',
            'line_items' => [[
                'price' => $priceId,
                'quantity' => 1,
            ]],
            'success_url' => config('app.frontend_url') . '/settings?tab=payments&subscribed=1',
            'cancel_url' => config('app.frontend_url') . '/pricing',
            'metadata' => [
                'user_id' => $user->id,
                'plan' => 'pro',
            ],
            'subscription_data' => [
                'metadata' => [
                    'user_id' => $user->id,
                    'plan' => 'pro',
                ],
            ],
        ]);

        return response()->json(['url' => $session->url]);
    }

    /**
     * Create a Stripe Customer Portal session for managing subscription.
     */
    public function portal(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->stripe_customer_id) {
            return response()->json(['message' => 'No billing account found.'], 422);
        }

        $session = \Stripe\BillingPortal\Session::create([
            'customer' => $user->stripe_customer_id,
            'return_url' => config('app.frontend_url') . '/settings?tab=payments',
        ]);

        return response()->json(['url' => $session->url]);
    }

    /**
     * Handle subscription webhooks from Stripe.
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.subscription_webhook_secret');

        // Fall back to main webhook secret if no separate one configured
        if (!$secret) {
            $secret = config('services.stripe.webhook_secret');
        }

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'customer.subscription.created':
            case 'customer.subscription.updated':
                $this->handleSubscriptionUpdated($event->data->object);
                break;

            case 'customer.subscription.deleted':
                $this->handleSubscriptionDeleted($event->data->object);
                break;
        }

        return response()->json(['received' => true]);
    }

    private function handleSubscriptionUpdated($subscription): void
    {
        $userId = $subscription->metadata->user_id ?? null;
        if (!$userId) return;

        $user = \App\Models\User::find($userId);
        if (!$user) return;

        $user->update([
            'stripe_subscription_id' => $subscription->id,
            'subscription_status' => $subscription->status,
            'plan' => $subscription->metadata->plan ?? 'pro',
            'subscription_ends_at' => $subscription->current_period_end
                ? \Carbon\Carbon::createFromTimestamp($subscription->current_period_end)
                : null,
        ]);
    }

    private function handleSubscriptionDeleted($subscription): void
    {
        $userId = $subscription->metadata->user_id ?? null;
        if (!$userId) return;

        $user = \App\Models\User::find($userId);
        if (!$user) return;

        $user->update([
            'subscription_status' => 'canceled',
            'plan' => 'free',
        ]);
    }
}
