<?php

namespace App\Services;

use App\Models\SupervisionAgreement;
use App\Models\User;
use Stripe\Stripe;
use Stripe\Customer;
use Stripe\Subscription;
use Stripe\Price;

class SupervisionAgreementStripeService
{
    public function __construct()
    {
        Stripe::setApiKey(config('services.stripe.secret'));
    }

    /**
     * Create a Stripe subscription for a supervision agreement.
     * The NP (practitioner) is the customer, physician receives funds via Connect.
     *
     * @throws \Stripe\Exception\ApiErrorException
     */
    public function createSubscription(SupervisionAgreement $agreement, User $npUser): array
    {
        $physician = $agreement->collaborationMatch->physicianProfile;

        if (!$physician || !$physician->stripe_connect_account_id) {
            throw new \Exception('Physician must have a Stripe Connect account');
        }

        // 1. Ensure NP has a Stripe customer ID
        if (!$npUser->stripe_customer_id) {
            $customer = Customer::create([
                'email' => $npUser->email,
                'name' => "{$npUser->first_name} {$npUser->last_name}",
                'metadata' => [
                    'cliniclink_user_id' => $npUser->id,
                    'type' => 'practitioner',
                ],
            ]);
            $npUser->update(['stripe_customer_id' => $customer->id]);
        } else {
            $customer = Customer::retrieve($npUser->stripe_customer_id);
        }

        // 2. Create a Price object for this specific agreement
        // (We create a new Price per agreement to allow custom amounts)
        $totalAmount = $agreement->monthly_fee_cents + $agreement->platform_fee_cents;

        $price = Price::create([
            'unit_amount' => $totalAmount,
            'currency' => 'usd',
            'recurring' => ['interval' => 'month'],
            'product_data' => [
                'name' => "Supervision Agreement - {$physician->user->first_name} {$physician->user->last_name}",
                'metadata' => [
                    'agreement_id' => $agreement->id,
                    'physician_id' => $physician->id,
                ],
            ],
        ]);

        // 3. Create subscription with application fee for platform
        $subscription = Subscription::create([
            'customer' => $customer->id,
            'items' => [['price' => $price->id]],
            'application_fee_percent' => floatval($agreement->platform_fee_percent),
            'transfer_data' => [
                'destination' => $physician->stripe_connect_account_id,
            ],
            'metadata' => [
                'agreement_id' => $agreement->id,
                'collaboration_match_id' => $agreement->collaboration_match_id,
                'physician_id' => $physician->id,
                'practitioner_id' => $npUser->id,
            ],
            'billing_cycle_anchor' => $this->getNextBillingAnchor($agreement->billing_anchor),
            'proration_behavior' => 'none',
        ]);

        return [
            'subscription_id' => $subscription->id,
            'customer_id' => $customer->id,
            'connected_account_id' => $physician->stripe_connect_account_id,
            'status' => $subscription->status,
        ];
    }

    /**
     * Cancel a subscription (immediate or at period end).
     */
    public function cancelSubscription(SupervisionAgreement $agreement, bool $immediate = false): void
    {
        if (!$agreement->stripe_subscription_id) {
            throw new \Exception('No subscription ID found');
        }

        $subscription = Subscription::retrieve($agreement->stripe_subscription_id);

        if ($immediate) {
            $subscription->cancel();
        } else {
            $subscription->cancel_at_period_end = true;
            $subscription->save();
        }
    }

    /**
     * Pause a subscription (using Stripe pause collection).
     */
    public function pauseSubscription(SupervisionAgreement $agreement): void
    {
        if (!$agreement->stripe_subscription_id) {
            throw new \Exception('No subscription ID found');
        }

        $subscription = Subscription::retrieve($agreement->stripe_subscription_id);
        $subscription->pause_collection = ['behavior' => 'void'];
        $subscription->save();
    }

    /**
     * Resume a paused subscription.
     */
    public function resumeSubscription(SupervisionAgreement $agreement): void
    {
        if (!$agreement->stripe_subscription_id) {
            throw new \Exception('No subscription ID found');
        }

        $subscription = Subscription::retrieve($agreement->stripe_subscription_id);
        $subscription->pause_collection = '';
        $subscription->save();
    }

    /**
     * Get the next billing anchor timestamp based on day of month.
     */
    private function getNextBillingAnchor(?int $dayOfMonth): ?int
    {
        if (!$dayOfMonth) {
            return null;
        }

        $now = now();
        $targetDay = min($dayOfMonth, $now->daysInMonth);

        // If target day hasn't passed this month, use it
        if ($now->day < $targetDay) {
            return $now->copy()->day($targetDay)->startOfDay()->timestamp;
        }

        // Otherwise, use target day next month
        return $now->copy()->addMonth()->day($targetDay)->startOfDay()->timestamp;
    }
}
