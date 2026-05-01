<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizAttempt extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'total_questions',
        'duration_minutes',
        'started_at',
        'ended_at',
        'expires_at',
        'score',
        'correct_answers',
        'incorrect_answers',
        'is_submitted',
        'is_timed_out',
        'question_ids',
        'is_guest_attempt',
        'guest_session_id',
    ];

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'ended_at' => 'datetime',
            'expires_at' => 'datetime',
            'is_submitted' => 'boolean',
            'is_timed_out' => 'boolean',
            'is_guest_attempt' => 'boolean',
            'question_ids' => 'array',
            'duration_minutes' => 'integer',
            'total_questions' => 'integer',
            'score' => 'integer',
            'correct_answers' => 'integer',
            'incorrect_answers' => 'integer',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'answers', 'quiz_attempt_id', 'question_id')
            ->withPivot(['selected_option_id', 'is_correct']);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && now()->isAfter($this->expires_at);
    }

    public function isPassed(): bool
    {
        return $this->score !== null && $this->score >= 70;
    }

    public function remainingSeconds(): int
    {
        if (!$this->expires_at || $this->is_submitted) {
            return 0;
        }

        return max(0, now()->diffInSeconds($this->expires_at, false));
    }
}
