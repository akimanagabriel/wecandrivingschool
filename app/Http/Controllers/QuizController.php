<?php

namespace App\Http\Controllers;

use App\Models\Answer;
use App\Models\Question;
use App\Models\QuizAttempt;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Session;

class QuizController extends Controller
{
    public function start(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (Session::get('is_guest_user')) {
            return redirect()->route('shared.quiz.start', ['token' => Session::get('shared_access_token')]);
        }

        if (!$user->hasActiveAccess()) {
            return redirect()->route('student.payment')->with('error', 'Please purchase access to take quizzes.');
        }

        $existing = QuizAttempt::where('user_id', $user->id)
            ->where('is_submitted', false)
            ->where('expires_at', '>', now())
            ->latest()
            ->first();

        if ($existing) {
            return redirect()->route('quiz.take', $existing->id);
        }

        $questionIds = Question::where('is_active', true)
            ->inRandomOrder()
            ->limit((int) config('wecan.quiz_questions', 20))
            ->pluck('id')
            ->toArray();

        if (count($questionIds) < 20) {
            return back()->with('error', 'Not enough questions available. Please try again later.');
        }

        $duration = (int) config('wecan.quiz_duration', 20);

        $attempt = QuizAttempt::create([
            'user_id' => $user->id,
            'total_questions' => count($questionIds),
            'duration_minutes' => $duration,
            'started_at' => now(),
            'expires_at' => now()->addMinutes($duration),
            'question_ids' => $questionIds,
        ]);

        return redirect()->route('quiz.take', $attempt->id);
    }

    public function take(Request $request, QuizAttempt $attempt): Response|RedirectResponse
    {
        $user = $request->user();

        if ($attempt->is_guest_attempt) {
            if (!Session::get('is_guest_user')) {
                abort(403);
            }
            return redirect()->route('shared.quiz.take', [
                'token' => Session::get('shared_access_token'),
                'attempt' => $attempt->id
            ]);
        }

        $this->authorizeAttempt($request->user(), $attempt);

        if ($attempt->isExpired() && !$attempt->is_submitted) {
            $this->processSubmit($attempt, []);
            return redirect()->route('quiz.results', $attempt->id);
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
            ->pluck('selected_option_id', 'question_id');

        return Inertia::render('student/quiz', [
            'attempt' => [
                'id' => $attempt->id,
                'remainingSeconds' => $attempt->remainingSeconds(),
                'totalQuestions' => $attempt->total_questions,
            ],
            'questions' => $questions,
            'savedAnswers' => $savedAnswers,
        ]);
    }

    public function saveAnswer(Request $request, QuizAttempt $attempt): JsonResponse
    {
        $this->authorizeAttempt($request->user(), $attempt);

        if ($attempt->is_submitted || $attempt->isExpired()) {
            return response()->json(['error' => 'Quiz already submitted or expired.'], 422);
        }

        $validated = $request->validate([
            'question_id' => 'required|integer',
            'option_id' => 'required|integer',
        ]);

        $questionId = (int) $validated['question_id'];
        $optionId = (int) $validated['option_id'];

        $question = Question::find($questionId);
        if (!$question || !in_array($questionId, $attempt->question_ids ?? [], true)) {
            return response()->json(['warning' => 'Question no longer available.'], 200);
        }

        $option = $question->options()->find($optionId);
        if (!$option) {
            return response()->json(['warning' => 'Option not valid for this question.'], 200);
        }

        Answer::updateOrCreate(
            ['quiz_attempt_id' => $attempt->id, 'question_id' => $questionId],
            ['selected_option_id' => $optionId, 'is_correct' => $option->is_correct]
        );

        return response()->json(['success' => true]);
    }

    public function submit(Request $request, QuizAttempt $attempt): RedirectResponse
    {
        $this->authorizeAttempt($request->user(), $attempt);

        if ($attempt->is_submitted) {
            return redirect()->route('quiz.results', $attempt->id);
        }

        $this->processSubmit($attempt, $request->input('answers', []));

        return redirect()->route('quiz.results', $attempt->id);
    }

    public function results(Request $request, QuizAttempt $attempt): Response|RedirectResponse
    {
        $this->authorizeAttempt($request->user(), $attempt);

        if (!$attempt->is_submitted) {
            return redirect()->route('quiz.take', $attempt->id);
        }

        $answers = Answer::with(['question.options', 'question.category', 'selectedOption'])
            ->where('quiz_attempt_id', $attempt->id)
            ->get()
            ->map(fn($a) => [
                'question_id' => $a->question_id,
                'question_text' => $a->question->question_text,
                'image_path' => $a->question->image_path,
                'category' => $a->question->category->name,
                'explanation' => $a->question->explanation,
                'explanation_audio_url' => $a->question->explanation_audio_path
                    ? asset('storage/' . $a->question->explanation_audio_path)
                    : null,
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

        return Inertia::render('student/results', [
            'attempt' => [
                'id' => $attempt->id,
                'score' => $attempt->score,
                'correct_answers' => $attempt->correct_answers,
                'incorrect_answers' => $attempt->incorrect_answers,
                'total_questions' => $attempt->total_questions,
                'is_passed' => $attempt->isPassed(),
                'started_at' => $attempt->started_at,
                'ended_at' => $attempt->ended_at,
                'is_timed_out' => $attempt->is_timed_out,
            ],
            'answers' => $answers,
        ]);
    }

    private function authorizeAttempt($user, QuizAttempt $attempt): void
    {
        if ($attempt->user_id !== $user->id && !$user->hasRole('admin')) {
            abort(403);
        }
    }

    private function processSubmit(QuizAttempt $attempt, array $answers): void
    {
        DB::transaction(function () use ($attempt, $answers) {
            $validQuestionIds = Question::whereIn('id', $attempt->question_ids ?? [])
                ->pluck('id')
                ->flip();

            foreach ($answers as $questionId => $optionId) {
                $questionId = (int) $questionId;
                $optionId = (int) $optionId;

                if (!$questionId || !$optionId) {
                    continue;
                }

                if (!isset($validQuestionIds[$questionId])) {
                    continue;
                }

                $option = \App\Models\Option::where('id', $optionId)
                    ->where('question_id', $questionId)
                    ->first();

                if (!$option) {
                    continue;
                }

                Answer::updateOrCreate(
                    ['quiz_attempt_id' => $attempt->id, 'question_id' => $questionId],
                    ['selected_option_id' => $optionId, 'is_correct' => $option->is_correct]
                );
            }

            $correct = Answer::where('quiz_attempt_id', $attempt->id)->where('is_correct', true)->count();
            $incorrect = Answer::where('quiz_attempt_id', $attempt->id)->where('is_correct', false)->count();
            $score = $attempt->total_questions > 0
                ? (int) round(($correct / $attempt->total_questions) * 100)
                : 0;

            $attempt->update([
                'is_submitted' => true,
                'is_timed_out' => $attempt->isExpired(),
                'ended_at' => now(),
                'score' => $score,
                'correct_answers' => $correct,
                'incorrect_answers' => $incorrect,
            ]);
        });
    }
}