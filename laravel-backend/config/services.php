<?php

return [

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'stripe' => [
        'secret' => env('STRIPE_SECRET_KEY'),
        'publishable' => env('STRIPE_PUBLISHABLE_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        'subscription_webhook_secret' => env('STRIPE_SUBSCRIPTION_WEBHOOK_SECRET'),
        'platform_fee_percent' => (float) env('STRIPE_PLATFORM_FEE_PERCENT', 10),
        'student_fee_enabled' => (bool) env('STUDENT_FEE_ENABLED', false),
        'student_fee_amount' => (float) env('STUDENT_FEE_AMOUNT', 9.99),
        'prices' => [
            'student_pro_monthly' => env('STRIPE_PRICE_STUDENT_PRO_MONTHLY'),
            'student_pro_yearly' => env('STRIPE_PRICE_STUDENT_PRO_YEARLY'),
        ],
    ],

];
