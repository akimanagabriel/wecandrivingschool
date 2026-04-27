<?php

namespace App\Services;

use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\SharedAccessLink;
use App\Models\SharedAccessSession;
use Illuminate\Support\Facades\Session;

class GuestQuizService
{
    public function isGuestUser(): bool
    {
        return Session::get('is_guest_user', false);
    }

    public function getSharedAccessLink(): ?SharedAccessLink
    {
        $token = Session::get('shared_access_token');
        if (!$token)
            return null;

        return SharedAccessLink::where('token', $token)->first();
    }

    public function createQuizAttempt(): QuizAttempt
    {
        $questionIds = Question::where('is_active', true)
            ->inRandomOrder()
            ->limit(20)
            ->pluck('id')
            ->toArray();

        $duration = config('wecan.quiz_duration', 20);

        $attempt = QuizAttempt::create([
            'user_id' => null, // Guest user
            'total_questions' => count($questionIds),
            'duration_minutes' => $duration,
            'started_at' => now(),
            'expires_at' => now()->addMinutes($duration),
            'question_ids' => $questionIds,
            'is_guest_attempt' => true, // Add this column to quiz_attempts table
        ]);

        // Link attempt to shared access session
        $session = SharedAccessSession::where('session_id', Session::getId())
            ->latest()
            ->first();

        if ($session) {
            $session->update(['quiz_attempt_id' => $attempt->id]);
        }

        return $attempt;
    }

    public function canContinueQuiz(QuizAttempt $attempt): bool
    {
        // Check if this attempt belongs to current guest session
        $session = SharedAccessSession::where('quiz_attempt_id', $attempt->id)
            ->where('session_id', Session::getId())
            ->exists();

        return $session || $attempt->user_id === null;
    }
}