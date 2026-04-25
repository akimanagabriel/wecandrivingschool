<?php

namespace App\Http\Controllers;

use App\Models\QuizAttempt;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StudentDashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $attempts = QuizAttempt::where('user_id', $user->id)
            ->where('is_submitted', true)
            ->latest()
            ->take(10)
            ->get()
            ->map(fn($a) => [
                'id'                => $a->id,
                'score'             => $a->score,
                'correct_answers'   => $a->correct_answers,
                'incorrect_answers' => $a->incorrect_answers,
                'total_questions'   => $a->total_questions,
                'is_passed'         => $a->isPassed(),
                'started_at'        => $a->started_at,
                'ended_at'          => $a->ended_at,
            ]);

        $activeAttempt = QuizAttempt::where('user_id', $user->id)
            ->where('is_submitted', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        return Inertia::render('student/dashboard', [
            'hasAccess'      => $user->hasActiveAccess(),
            'passRate'       => $user->passRate(),
            'totalAttempts'  => $attempts->count(),
            'bestScore'      => $attempts->max('score') ?? 0,
            'recentAttempts' => $attempts,
            'activeAttempt'  => $activeAttempt ? [
                'id'               => $activeAttempt->id,
                'remainingSeconds' => $activeAttempt->remainingSeconds(),
            ] : null,
        ]);
    }
}
