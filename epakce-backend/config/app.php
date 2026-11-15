<?php

return [

    'name' => env('APP_NAME', 'Epakçe'),

    'env' => env('APP_ENV', 'production'),

    'debug' => (bool) env('APP_DEBUG', false),

    'url' => env('APP_URL', 'http://localhost:3000'),

    'timezone' => 'Europe/Istanbul',

    'locale' => 'tr',

    'fallback_locale' => 'en',

    'faker_locale' => 'tr_TR',

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY', 'base64:uN2Vj5N9xL4zK8wP1qR3sT5vY7aC9eG1iJ3kL5mO7pQ='),

    'previous_keys' => [
        ...array_filter(
            explode(',', env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    'maintenance' => [
        'driver' => 'file',
    ],

];
