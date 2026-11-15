<?php

return [
    'api_key' => env('GROQ_API_KEY'),
    'model' => env('GROQ_MODEL', 'openai/gpt-oss-120b'),
    'base_url' => env('GROQ_BASE_URL', 'https://api.groq.com/openai/v1'),
    'timeout' => (int) env('GROQ_TIMEOUT', 60),
];
