<?php

return [
    'access_price'     => env('WECAN_ACCESS_PRICE', 5000),
    'access_price_usd' => env('WECAN_ACCESS_PRICE_USD', 5),
    'quiz_questions'   => env('QUIZ_QUESTION_COUNT', 20),
    'quiz_duration'    => env('QUIZ_DURATION_MINUTES', 20),
    'pass_score'       => env('QUIZ_PASS_SCORE', 70),
];
