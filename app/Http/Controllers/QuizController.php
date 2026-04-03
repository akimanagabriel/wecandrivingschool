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

class QuizController extends Controller
{
    /** Start or resume a quiz attempt. */
    public function start(Request $request): RedirectResponse
    {
        $user = $request->user();

        if (! $user->hasActiveAccess()) {
            return redirect()->route('student.payment')->with('error', 'Please purchase access to take quizzes.');
        }

        // Resume an active attempt if one exists
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
            'user_id'          => $user->id,
            'total_questions'  => count($questionIds),
            'duration_minutes' => $duration,
            'started_at'       => now(),
            'expires_at'       => now()->addMinutes($duration),
            'question_ids'     => $questionIds,
        ]);

        return redirect()->route('quiz.take', $attempt->id);
    }

    /** Show the quiz page. */
    public function take(Request $request, QuizAttempt $attempt): Response|RedirectResponse
    {
        $this->authorizeAttempt($request->user(), $attempt);

        // Auto-submit if expired
        if ($attempt->isExpired() && ! $attempt->is_submitted) {
            $this->processSubmit($attempt, []);

            return redirect()->route('quiz.results', $attempt->id);
        }

        $questions = Question::with(['options', 'category'])
            ->whereIn('id', $attempt->question_ids)
            ->get()
            ->sortBy(fn ($q) => array_search($q->id, $attempt->question_ids))
            ->values()
            ->map(fn ($q) => [
                'id'            => $q->id,
                'question_text' => $q->question_text,
                'image_path'    => $q->image_path,
                'category'      => $q->category->name,
                'options'       => $q->options->shuffle()->values()->map(fn ($o) => [
                    'id'          => $o->id,
                    'option_text' => $o->option_text,
                ]),
            ]);

        $savedAnswers = Answer::where('quiz_attempt_id', $attempt->id)
            ->pluck('selected_option_id', 'question_id');

        return Inertia::render('student/quiz', [
            'attempt' => [
                'id'               => $attempt->id,
                'remainingSeconds' => $attempt->remainingSeconds(),
                'totalQuestions'   => $attempt->total_questions,
            ],
            'questions'    => $questions,
            'savedAnswers' => $savedAnswers,
        ]);
    }

    /** Save a single answer via AJAX. */
    public function saveAnswer(Request $request, QuizAttempt $attempt): JsonResponse
    {
        $this->authorizeAttempt($request->user(), $attempt);

        if ($attempt->is_submitted || $attempt->isExpired()) {
            return response()->json(['error' => 'Quiz already submitted or expired.'], 422);
        }

        $validated = $request->validate([
            'question_id' => 'required|integer',
            'option_id'   => 'required|integer',
        ]);

        $questionId = (int) $validated['question_id'];
        $optionId   = (int) $validated['option_id'];

        // Guard: question must still exist and belong to this attempt
        $question = \App\Models\Question::find($questionId);
        if (! $question || ! in_array($questionId, $attempt->question_ids ?? [], true)) {
            return response()->json(['warning' => 'Question no longer available.'], 200);
        }

        // Guard: option must belong to this question
        $option = $question->options()->find($optionId);
        if (! $option) {
            return response()->json(['warning' => 'Option not valid for this question.'], 200);
        }

        Answer::updateOrCreate(
            ['quiz_attempt_id' => $attempt->id, 'question_id' => $questionId],
            ['selected_option_id' => $optionId, 'is_correct' => $option->is_correct]
        );

        return response()->json(['success' => true]);
    }

    /** Final quiz submission. */
    public function submit(Request $request, QuizAttempt $attempt): RedirectResponse
    {
        $this->authorizeAttempt($request->user(), $attempt);

        if ($attempt->is_submitted) {
            return redirect()->route('quiz.results', $attempt->id);
        }

        $this->processSubmit($attempt, $request->input('answers', []));

        return redirect()->route('quiz.results', $attempt->id);
    }

    /** Show quiz results. */
    public function results(Request $request, QuizAttempt $attempt): Response|RedirectResponse
    {
        $this->authorizeAttempt($request->user(), $attempt);

        if (! $attempt->is_submitted) {
            return redirect()->route('quiz.take', $attempt->id);
        }

        $answers = Answer::with(['question.options', 'question.category', 'selectedOption'])
            ->where('quiz_attempt_id', $attempt->id)
            ->get()
            ->map(fn ($a) => [
                'question_id'          => $a->question_id,
                'question_text'        => $a->question->question_text,
                'category'             => $a->question->category->name,
                'explanation'          => $a->question->explanation,
                'explanation_audio_url' => $a->question->explanation_audio_path
                    ? asset('storage/' . $a->question->explanation_audio_path)
                    : null,
                'is_correct'           => $a->is_correct,
                'selected_option'      => $a->selectedOption?->option_text,
                'correct_option'       => $a->question->options->firstWhere('is_correct', true)?->option_text,
                'all_options'          => $a->question->options->map(fn ($o) => [
                    'id'         => $o->id,
                    'text'       => $o->option_text,
                    'is_correct' => $o->is_correct,
                ]),
            ]);

        return Inertia::render('student/results', [
            'attempt' => [
                'id'                => $attempt->id,
                'score'             => $attempt->score,
                'correct_answers'   => $attempt->correct_answers,
                'incorrect_answers' => $attempt->incorrect_answers,
                'total_questions'   => $attempt->total_questions,
                'is_passed'         => $attempt->isPassed(),
                'started_at'        => $attempt->started_at,
                'ended_at'          => $attempt->ended_at,
                'is_timed_out'      => $attempt->is_timed_out,
            ],
            'answers' => $answers,
        ]);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function authorizeAttempt($user, QuizAttempt $attempt): void
    {
        if ($attempt->user_id !== $user->id && ! $user->hasRole('admin')) {
            abort(403);
        }
    }

    private function processSubmit(QuizAttempt $attempt, array $answers): void
    {
        DB::transaction(function () use ($attempt, $answers) {
            // Collect valid question IDs that still exist in the DB from this attempt.
            // Questions may have been deleted by an admin after the quiz started.
            $validQuestionIds = \App\Models\Question::
                whereIn('id', $attempt->question_ids ?? [])
                ->pluck('id')
                ->flip(); // keyed by id for O(1) lookup

            foreach ($answers as $questionId => $optionId) {
                $questionId = (int) $questionId;
                $optionId   = (int) $optionId;

                if (! $questionId || ! $optionId) {
                    continue;
                }

                // Skip questions that were deleted since the attempt was created
                if (! isset($validQuestionIds[$questionId])) {
                    continue;
                }

                // Validate the option still exists and belongs to this question
                $option = \App\Models\Option::where('id', $optionId)
                    ->where('question_id', $questionId)
                    ->first();

                if (! $option) {
                    continue;
                }

                Answer::updateOrCreate(
                    ['quiz_attempt_id' => $attempt->id, 'question_id' => $questionId],
                    ['selected_option_id' => $optionId, 'is_correct' => $option->is_correct]
                );
            }

            $correct   = Answer::where('quiz_attempt_id', $attempt->id)->where('is_correct', true)->count();
            $incorrect = Answer::where('quiz_attempt_id', $attempt->id)->where('is_correct', false)->count();
            $score     = $attempt->total_questions > 0
                ? (int) round(($correct / $attempt->total_questions) * 100)
                : 0;

            $attempt->update([
                'is_submitted'      => true,
                'is_timed_out'      => $attempt->isExpired(),
                'ended_at'          => now(),
                'score'             => $score,
                'correct_answers'   => $correct,
                'incorrect_answers' => $incorrect,
            ]);
        });
    }
}
