<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'),
        'https://michelevens.github.io',
        'https://frontend-seven-olive-39.vercel.app',
    ],

    'allowed_origins_patterns' => [
        '#^https://frontend.*-evens-michels-projects\.vercel\.app$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
