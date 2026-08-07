<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PublicQuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'public_quiz_link_id',
        'ip_address',
        'session_id',
        'user_agent',
        'user_name',
        'user_email',
        'score',
        'correct_answers',
        'incorrect_answers',
        'total_questions',
        'is_completed',
        'is_passed',
        'started_at',
        'completed_at',
        'answers',
        'question_ids',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'completed_at' => 'datetime',
        'answers' => 'array',
        'question_ids' => 'array',
        'is_completed' => 'boolean',
        'is_passed' => 'boolean',
        'score' => 'integer',
        'correct_answers' => 'integer',
        'incorrect_answers' => 'integer',
        'total_questions' => 'integer',
    ];

    public function link()
    {
        return $this->belongsTo(PublicQuizLink::class, 'public_quiz_link_id');
    }
}