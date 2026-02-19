<?php

namespace App\Http\Controllers;

use App\Models\SupervisionAgreement;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class StripeWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sig_header = $request->header('Stripe-Signature');
        $endpoint_secret = config('services.stripe.webhook_secret');

        try {
            // TODO: Verify webhook signature using Stripe SDK
            // $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);

            // For now, just parse the payload
            $event = json_decode($payload, true);

            // Handle the event
            switch ($event['type']) {
                case 'invoice.paid':
                    $this->handleInvoicePaid($event);
                    break;

                case 'invoice.payment_failed':
                    $this->handlePaymentFailed($event);
                    break;

                case 'customer.subscription.updated':
                    $this->handleSubscriptionUpdated($event);
                    break;

                case 'customer.subscription.deleted':
                    $this->handleSubscriptionDeleted($event);
                    break;

                default:
                    Log::info('Unhandled Stripe webhook event', ['type' => $event['type']]);
            }

            return response()->json(['received' => true]);
        } catch (\Exception $e) {
            Log::error('Stripe webhook error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json(['error' => 'Webhook handling failed'], 500);
        }
    }

    protected function handleInvoicePaid(array $event): void
    {
        $invoice = $event['data']['object'];
        $subscriptionId = $invoice['subscription'] ?? null;

        if (!$subscriptionId) {
            return;
        }

        $agreement = SupervisionAgreement::where('stripe_subscription_id', $subscriptionId)->first();

        if ($agreement) {
            $agreement->update([
                'last_payment_status' => 'paid',
            ]);

            // TODO: Log audit event
            Log::info('Invoice paid', [
                'agreement_id' => $agreement->id,
                'invoice_id' => $invoice['id'],
            ]);
        }
    }

    protected function handlePaymentFailed(array $event): void
    {
        $invoice = $event['data']['object'];
        $subscriptionId = $invoice['subscription'] ?? null;

        if (!$subscriptionId) {
            return;
        }

        $agreement = SupervisionAgreement::where('stripe_subscription_id', $subscriptionId)->first();

        if ($agreement) {
            $agreement->update([
                'last_payment_status' => 'failed',
            ]);

            // TODO: Implement failure counter and auto-pause after X failures
            // TODO: Send notifications to both parties
            // TODO: Log audit event

            Log::warning('Payment failed', [
                'agreement_id' => $agreement->id,
                'invoice_id' => $invoice['id'],
            ]);
        }
    }

    protected function handleSubscriptionUpdated(array $event): void
    {
        $subscription = $event['data']['object'];
        $subscriptionId = $subscription['id'];

        $agreement = SupervisionAgreement::where('stripe_subscription_id', $subscriptionId)->first();

        if ($agreement) {
            // TODO: Handle subscription status changes
            Log::info('Subscription updated', [
                'agreement_id' => $agreement->id,
                'subscription_id' => $subscriptionId,
                'status' => $subscription['status'],
            ]);
        }
    }

    protected function handleSubscriptionDeleted(array $event): void
    {
        $subscription = $event['data']['object'];
        $subscriptionId = $subscription['id'];

        $agreement = SupervisionAgreement::where('stripe_subscription_id', $subscriptionId)->first();

        if ($agreement && !$agreement->isTerminated()) {
            $agreement->update([
                'status' => 'terminated',
                'terminated_at' => now(),
                'termination_reason' => 'Subscription canceled in Stripe',
            ]);

            // TODO: Log audit event
            Log::info('Subscription deleted', [
                'agreement_id' => $agreement->id,
                'subscription_id' => $subscriptionId,
            ]);
        }
    }
}
