<?php

namespace App\Http\Controllers;

use App\Models\SharedAccessLink;
use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Option;
use App\Models\SharedAccessSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SharedAccessController extends Controller
{
    public function access(Request $request, string $token)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link) {
            return redirect()->back()->with('error', 'This access link has expired or reached its maximum usage limit.');
        }

        if ($link && ($link->is_expired || $link->used_count >= $link->max_uses)) {
            return redirect()->back()->with('error', 'This access link has expired or reached its maximum usage limit.');
        }

        return redirect()->route('shared.quiz.start', ['token' => $token]);
    }

    public function startQuiz(Request $request, string $token)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link) {
            return redirect()->route('shared.access', ['token' => $token])->with('error', 'This access link has expired or reached its maximum usage limit.');
        }

        $guestSessionId = Session::getId();

        $existingAttempt = QuizAttempt::where('guest_session_id', $guestSessionId)
            ->where('is_submitted', false)
            ->where('is_guest_attempt', true)
            ->where('expires_at', '>', now())
            ->first();

        if ($existingAttempt) {
            return redirect()->route('shared.quiz.take', [
                'token' => $token,
                'attempt' => $existingAttempt->id
            ]);
        }

        $questionIds = Question::where('is_active', true)
            ->inRandomOrder()
            ->limit(20)
            ->pluck('id')
            ->toArray();

        if (count($questionIds) < 20) {
            abort(500, 'Not enough questions available. Please contact administrator.');
        }

        $durationMinutes = (int) config('wecan.quiz_duration', 20);

        $attempt = QuizAttempt::create([
            'user_id' => null,
            'total_questions' => count($questionIds),
            'duration_minutes' => $durationMinutes,
            'started_at' => now(),
            'expires_at' => now()->addMinutes($durationMinutes),
            'question_ids' => $questionIds,
            'is_guest_attempt' => true,
            'guest_session_id' => $guestSessionId,
        ]);

        SharedAccessSession::where('session_id', $guestSessionId)
            ->where('shared_access_link_id', $link->id)
            ->whereNull('quiz_attempt_id')
            ->latest()
            ->update(['quiz_attempt_id' => $attempt->id]);

        return redirect()->route('shared.quiz.take', [
            'token' => $token,
            'attempt' => $attempt->id
        ]);
    }

    public function takeQuiz(Request $request, string $token, QuizAttempt $attempt)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link) {
            return redirect()->route('shared.access', ['token' => $token])->with('error', 'This access link has expired or reached its maximum usage limit.');
        }

        $this->ensureAttemptMatchesToken($link, $attempt);

        if ($attempt->is_submitted) {
            return redirect()->route('shared.quiz.results', [
                'token' => $token,
                'attempt' => $attempt->id
            ]);
        }

        if ($attempt->isExpired()) {
            $this->processSubmission($attempt, []);
            return redirect()->route('shared.quiz.results', [
                'token' => $token,
                'attempt' => $attempt->id
            ]);
        }

        $questions = Question::with(['options', 'category'])
            ->whereIn('id', $attempt->question_ids)
            ->get()
            ->sortBy(fn($q) => array_search($q->id, $attempt->question_ids))
            ->values()
            ->map(fn($q) => [
                'id' => $q->id,
                'question_text' => $q->question_text,
                'image_path' => $q->image_path,
                'category' => $q->category->name,
                'options' => $q->options->shuffle()->values()->map(fn($o) => [
                    'id' => $o->id,
                    'option_text' => $o->option_text,
                    'image_path' => $o->image_path,
                ]),
            ]);

        $savedAnswers = Answer::where('quiz_attempt_id', $attempt->id)
            ->pluck('selected_option_id', 'question_id')
            ->toArray();

        return Inertia::render('guest/quiz', [
            'token' => $token,
            'attempt' => [
                'id' => $attempt->id,
                'remainingSeconds' => $attempt->remainingSeconds(),
                'totalQuestions' => $attempt->total_questions,
            ],
            'questions' => $questions,
            'savedAnswers' => $savedAnswers,
        ]);
    }

    public function saveAnswer(Request $request, string $token, QuizAttempt $attempt)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link) {
            return redirect()->back()->with('error', 'Link expired');
        }

        $this->ensureAttemptMatchesToken($link, $attempt);

        if (!$attempt->is_guest_attempt) {
            return redirect()->back()->with('error', 'Invalid attempt');
        }

        if ($attempt->is_submitted) {
            return redirect()->back()->with('error', 'Quiz already submitted');
        }

        if ($attempt->isExpired()) {
            return redirect()->back()->with('error', 'Quiz expired');
        }

        $validated = $request->validate([
            'question_id' => 'required|integer',
            'option_id' => 'required|integer',
        ]);

        $questionId = (int) $validated['question_id'];
        $optionId = (int) $validated['option_id'];

        if (!in_array($questionId, $attempt->question_ids ?? [])) {
            return redirect()->back()->with('error', 'Question not in this quiz');
        }

        $option = Option::where('id', $optionId)
            ->where('question_id', $questionId)
            ->first();

        if (!$option) {
            return redirect()->back()->with('error', 'Invalid option');
        }

        Answer::updateOrCreate(
            [
                'quiz_attempt_id' => $attempt->id,
                'question_id' => $questionId
            ],
            [
                'selected_option_id' => $optionId,
                'is_correct' => $option->is_correct
            ]
        );

        return redirect()->back();
    }

    public function submitQuiz(Request $request, string $token, QuizAttempt $attempt)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link) {
            return redirect()->back()->with('error', 'Link expired');
        }

        $this->ensureAttemptMatchesToken($link, $attempt);

        if ($attempt->is_submitted) {
            return redirect()->route('shared.quiz.results', [
                'token' => $token,
                'attempt' => $attempt->id
            ]);
        }

        $this->processSubmission($attempt, $request->input('answers', []));

        return redirect()->route('shared.quiz.results', [
            'token' => $token,
            'attempt' => $attempt->id
        ]);
    }

    public function results(Request $request, string $token, QuizAttempt $attempt)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link) {
            return redirect()->route('shared.access', ['token' => $token])->with('error', 'This access link has expired or reached its maximum usage limit.');
        }

        $this->ensureAttemptMatchesToken($link, $attempt);

        $answers = Answer::with(['question.options', 'question.category', 'selectedOption'])
            ->where('quiz_attempt_id', $attempt->id)
            ->get()
            ->map(fn($a) => [
                'question_id' => $a->question_id,
                'question_text' => $a->question->question_text,
                'image_path' => $a->question->image_path,
                'category' => $a->question->category->name,
                'explanation' => $a->question->explanation,
                'is_correct' => $a->is_correct,
                'selected_option' => $a->selectedOption?->option_text,
                'selected_option_image' => $a->selectedOption?->image_path,
                'correct_option' => $a->question->options->firstWhere('is_correct', true)?->option_text,
                'correct_option_image' => $a->question->options->firstWhere('is_correct', true)?->image_path,
                'all_options' => $a->question->options->map(fn($o) => [
                    'id' => $o->id,
                    'text' => $o->option_text,
                    'image_path' => $o->image_path,
                    'is_correct' => $o->is_correct,
                ]),
            ]);

        return Inertia::render('guest/results', [
            'token' => $token,
            'attempt' => [
                'id' => $attempt->id,
                'score' => $attempt->score,
                'correct_answers' => $attempt->correct_answers,
                'incorrect_answers' => $attempt->incorrect_answers,
                'total_questions' => $attempt->total_questions,
                'is_passed' => $attempt->isPassed(),
            ],
            'answers' => $answers,
        ]);
    }

    private function ensureAttemptMatchesToken(SharedAccessLink $link, QuizAttempt $attempt): void
    {
        $exists = SharedAccessSession::where('shared_access_link_id', $link->id)
            ->where('quiz_attempt_id', $attempt->id)
            ->exists();

        if (!$exists) {
            redirect()->route('shared.access', ['token' => $link->token])->with('error', 'This access link has expired or reached its maximum usage limit.');
        }
    }

    private function processSubmission(QuizAttempt $attempt, array $answers): void
    {
        DB::transaction(function () use ($attempt, $answers) {
            foreach ($answers as $questionId => $optionId) {
                $questionId = (int) $questionId;
                $optionId = (int) $optionId;

                if (!$questionId || !$optionId) {
                    continue;
                }

                if (!in_array($questionId, $attempt->question_ids ?? [])) {
                    continue;
                }

                $option = Option::where('id', $optionId)
                    ->where('question_id', $questionId)
                    ->first();

                if (!$option) {
                    continue;
                }

                Answer::updateOrCreate(
                    [
                        'quiz_attempt_id' => $attempt->id,
                        'question_id' => $questionId
                    ],
                    [
                        'selected_option_id' => $optionId,
                        'is_correct' => $option->is_correct
                    ]
                );
            }

            $correct = Answer::where('quiz_attempt_id', $attempt->id)
                ->where('is_correct', true)
                ->count();

            $total = $attempt->total_questions;
            $score = $total > 0 ? (int) round(($correct / $total) * 100) : 0;

            if ($attempt->is_guest_attempt) {
                SharedAccessLink::whereHas('sessions', function ($query) use ($attempt) {
                    $query->where('quiz_attempt_id', $attempt->id);
                })->increment('used_count');
            }

            $attempt->update([
                'is_submitted' => true,
                'is_timed_out' => $attempt->isExpired(),
                'ended_at' => now(),
                'score' => $score,
                'correct_answers' => $correct,
                'incorrect_answers' => $total - $correct,
            ]);
        });
    }
}