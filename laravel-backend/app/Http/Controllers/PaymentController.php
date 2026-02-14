<?php

namespace App\Http\Controllers;

use App\Mail\PaymentReceiptMail;
use App\Models\Application;
use App\Models\Payment;
use App\Models\User;
use App\Notifications\PaymentReceivedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Stripe\Stripe;
use Stripe\Account;
use Stripe\AccountLink;
use Stripe\PaymentIntent;
use Stripe\Webhook;

class PaymentController extends Controller
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe Connect Express account for a site manager.
     */
    public function createConnectAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->stripe_account_id) {
            // Already has an account, generate new link
            $link = AccountLink::create([
                'account' => $user->stripe_account_id,
                'refresh_url' => config('app.frontend_url') . '/settings?tab=payments&refresh=1',
                'return_url' => config('app.frontend_url') . '/settings?tab=payments&connected=1',
                'type' => 'account_onboarding',
            ]);

            return response()->json(['url' => $link->url]);
        }

        $account = Account::create([
            'type' => 'express',
            'email' => $user->email,
            'metadata' => ['cliniclink_user_id' => $user->id],
            'capabilities' => [
                'card_payments' => ['requested' => true],
                'transfers' => ['requested' => true],
            ],
        ]);

        $user->update(['stripe_account_id' => $account->id]);

        $link = AccountLink::create([
            'account' => $account->id,
            'refresh_url' => config('app.frontend_url') . '/settings?tab=payments&refresh=1',
            'return_url' => config('app.frontend_url') . '/settings?tab=payments&connected=1',
            'type' => 'account_onboarding',
        ]);

        return response()->json(['url' => $link->url]);
    }

    /**
     * Get Stripe Connect onboarding status.
     */
    public function connectAccountStatus(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->stripe_account_id) {
            return response()->json([
                'connected' => false,
                'onboarded' => false,
                'account_id' => null,
            ]);
        }

        try {
            $account = Account::retrieve($user->stripe_account_id);

            $onboarded = $account->charges_enabled && $account->payouts_enabled;

            if ($onboarded && !$user->stripe_onboarded) {
                $user->update(['stripe_onboarded' => true]);
            }

            return response()->json([
                'connected' => true,
                'onboarded' => $onboarded,
                'account_id' => $user->stripe_account_id,
                'charges_enabled' => $account->charges_enabled,
                'payouts_enabled' => $account->payouts_enabled,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'connected' => true,
                'onboarded' => $user->stripe_onboarded,
                'account_id' => $user->stripe_account_id,
                'error' => 'Could not verify account status',
            ]);
        }
    }

    /**
     * Generate a fresh Connect onboarding link.
     */
    public function refreshConnectLink(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->stripe_account_id) {
            return response()->json(['message' => 'No Stripe account found. Create one first.'], 422);
        }

        $link = AccountLink::create([
            'account' => $user->stripe_account_id,
            'refresh_url' => config('app.frontend_url') . '/settings?tab=payments&refresh=1',
            'return_url' => config('app.frontend_url') . '/settings?tab=payments&connected=1',
            'type' => 'account_onboarding',
        ]);

        return response()->json(['url' => $link->url]);
    }

    /**
     * Create a checkout session for a paid application.
     */
    public function createCheckoutSession(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'application_id' => ['required', 'uuid', 'exists:applications,id'],
        ]);

        $user = $request->user();
        $application = Application::with('slot.site.manager')->findOrFail($validated['application_id']);

        if ($application->student_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($application->payment_status === 'paid') {
            return response()->json(['message' => 'Already paid'], 422);
        }

        $slot = $application->slot;
        $siteManager = $slot->site->manager;

        if (!$siteManager || !$siteManager->stripe_onboarded) {
            return response()->json(['message' => 'Site has not set up payment processing'], 422);
        }

        $amount = (int) ($slot->cost * 100); // cents
        $platformFeePercent = config('services.stripe.platform_fee_percent', 10);
        $platformFee = (int) ($amount * $platformFeePercent / 100);

        // Create payment record
        $payment = Payment::create([
            'payer_id' => $user->id,
            'payee_id' => $siteManager->id,
            'application_id' => $application->id,
            'slot_id' => $slot->id,
            'amount' => $slot->cost,
            'platform_fee' => $platformFee / 100,
            'currency' => 'usd',
            'status' => 'pending',
        ]);

        $application->update([
            'payment_status' => 'pending',
            'payment_id' => $payment->id,
        ]);

        // Create Stripe PaymentIntent
        $paymentIntent = PaymentIntent::create([
            'amount' => $amount,
            'currency' => 'usd',
            'application_fee_amount' => $platformFee,
            'transfer_data' => [
                'destination' => $siteManager->stripe_account_id,
            ],
            'metadata' => [
                'payment_id' => $payment->id,
                'application_id' => $application->id,
                'student_id' => $user->id,
            ],
        ]);

        $payment->update(['stripe_payment_intent_id' => $paymentIntent->id]);

        return response()->json([
            'client_secret' => $paymentIntent->client_secret,
            'payment_id' => $payment->id,
            'amount' => $slot->cost,
        ]);
    }

    /**
     * Payment history for the authenticated user.
     */
    public function paymentHistory(Request $request): JsonResponse
    {
        $user = $request->user();

        $payments = Payment::with(['payer:id,first_name,last_name,email', 'payee:id,first_name,last_name,email', 'slot.site:id,name'])
            ->where(function ($q) use ($user) {
                $q->where('payer_id', $user->id)
                    ->orWhere('payee_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }

    /**
     * Refund a completed payment.
     */
    public function refund(Request $request, Payment $payment): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'admin' && $payment->payee_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        if ($payment->status !== 'completed') {
            return response()->json(['message' => 'Payment is not completed'], 422);
        }

        try {
            $refund = \Stripe\Refund::create([
                'payment_intent' => $payment->stripe_payment_intent_id,
                'reverse_transfer' => true,
                'refund_application_fee' => true,
            ]);

            $payment->update([
                'status' => 'refunded',
                'refunded_at' => now(),
            ]);

            $payment->application?->update(['payment_status' => 'refunded']);

            return response()->json(['message' => 'Payment refunded', 'payment' => $payment->fresh()]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Refund failed: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Handle Stripe webhooks.
     */
    public function webhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $secret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $secret);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Invalid signature'], 400);
        }

        switch ($event->type) {
            case 'payment_intent.succeeded':
                $this->handlePaymentSucceeded($event->data->object);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentFailed($event->data->object);
                break;

            case 'account.updated':
                $this->handleAccountUpdated($event->data->object);
                break;
        }

        return response()->json(['received' => true]);
    }

    private function handlePaymentSucceeded($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();
        if (!$payment) return;

        $payment->update([
            'status' => 'completed',
            'paid_at' => now(),
            'stripe_transfer_id' => $paymentIntent->transfer ?? null,
        ]);

        $payment->application?->update(['payment_status' => 'paid']);

        // Send receipt email
        $payer = $payment->payer;
        if ($payer) {
            Mail::to($payer->email)->queue(new PaymentReceiptMail($payment));
            $payer->notify(new PaymentReceivedNotification($payment));
        }

        // Notify payee
        $payee = $payment->payee;
        if ($payee) {
            $payee->notify(new PaymentReceivedNotification($payment));
        }
    }

    private function handlePaymentFailed($paymentIntent): void
    {
        $payment = Payment::where('stripe_payment_intent_id', $paymentIntent->id)->first();
        if (!$payment) return;

        $payment->update(['status' => 'failed']);
        $payment->application?->update(['payment_status' => 'pending']);
    }

    private function handleAccountUpdated($account): void
    {
        $user = User::where('stripe_account_id', $account->id)->first();
        if (!$user) return;

        $onboarded = $account->charges_enabled && $account->payouts_enabled;
        $user->update(['stripe_onboarded' => $onboarded]);
    }
}
