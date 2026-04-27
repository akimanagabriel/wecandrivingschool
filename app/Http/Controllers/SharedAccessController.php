<?php

namespace App\Http\Controllers;

use App\Models\SharedAccessLink;
use App\Models\QuizAttempt;
use App\Models\Question;
use App\Models\Answer;
use App\Models\Option;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SharedAccessController extends Controller
{
    public function access(Request $request, string $token)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link || !$link->isValid()) {
            abort(403, 'This access link has expired or reached its maximum usage limit.');
        }

        // Start quiz automatically for guest users
        return redirect()->route('shared.quiz.start', ['token' => $token]);
    }

    public function startQuiz(Request $request, string $token)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link || !$link->isValid()) {
            abort(403, 'This access link has expired or reached its maximum usage limit.');
        }

        // Check if there's an existing active attempt
        $existingAttempt = QuizAttempt::where('guest_session_id', Session::getId())
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

        // Create new attempt
        $questionIds = Question::where('is_active', true)
            ->inRandomOrder()
            ->limit(20)
            ->pluck('id')
            ->toArray();

        $duration = (int) config('wecan.quiz_duration', 20); // Cast to integer

        // FIX: Make sure duration is an integer
        $durationMinutes = is_numeric($duration) ? (int) $duration : 20;

        $attempt = QuizAttempt::create([
            'user_id' => null,
            'total_questions' => count($questionIds),
            'duration_minutes' => $durationMinutes,
            'started_at' => now(),
            'expires_at' => now()->addMinutes($durationMinutes), // This line was failing
            'question_ids' => $questionIds,
            'is_guest_attempt' => true,
            'guest_session_id' => Session::getId(),
        ]);

        return redirect()->route('shared.quiz.take', [
            'token' => $token,
            'attempt' => $attempt->id
        ]);
    }

    public function takeQuiz(Request $request, string $token, QuizAttempt $attempt)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link || !$link->isValid()) {
            abort(403, 'This access link has expired.');
        }

        // Verify ownership
        if ($attempt->guest_session_id !== Session::getId() || !$attempt->is_guest_attempt) {
            abort(403);
        }

        if ($attempt->isExpired() && !$attempt->is_submitted) {
            // Auto-submit if expired
            $this->submitQuiz($attempt);
            return redirect()->route('shared.quiz.results', ['token' => $token, 'attempt' => $attempt->id]);
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
                ]),
            ]);

        $savedAnswers = Answer::where('quiz_attempt_id', $attempt->id)
            ->pluck('selected_option_id', 'question_id');

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

        if (!$link || !$link->isValid()) {
            return response()->json(['error' => 'Link expired'], 403);
        }

        if ($attempt->guest_session_id !== Session::getId() || !$attempt->is_guest_attempt) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($attempt->is_submitted || $attempt->isExpired()) {
            return response()->json(['error' => 'Quiz already submitted or expired'], 422);
        }

        $validated = $request->validate([
            'question_id' => 'required|integer',
            'option_id' => 'required|integer',
        ]);

        $question = Question::find($validated['question_id']);
        if (!$question || !in_array($question->id, $attempt->question_ids ?? [])) {
            return response()->json(['warning' => 'Question not available'], 200);
        }

        $option = $question->options()->find($validated['option_id']);
        if (!$option) {
            return response()->json(['warning' => 'Option not valid'], 200);
        }

        Answer::updateOrCreate(
            ['quiz_attempt_id' => $attempt->id, 'question_id' => $validated['question_id']],
            ['selected_option_id' => $validated['option_id'], 'is_correct' => $option->is_correct]
        );

        return response()->json(['success' => true]);
    }

    public function submitQuiz(Request $request, string $token, QuizAttempt $attempt)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link || !$link->isValid()) {
            abort(403);
        }

        if ($attempt->guest_session_id !== Session::getId() || !$attempt->is_guest_attempt) {
            abort(403);
        }

        $this->processSubmission($attempt, $request->input('answers', []));

        return redirect()->route('shared.quiz.results', ['token' => $token, 'attempt' => $attempt->id]);
    }

    public function results(Request $request, string $token, QuizAttempt $attempt)
    {
        $link = SharedAccessLink::where('token', $token)->first();

        if (!$link) {
            abort(404);
        }

        if ($attempt->guest_session_id !== Session::getId() || !$attempt->is_guest_attempt) {
            abort(403);
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
                'is_correct' => $a->is_correct,
                'selected_option' => $a->selectedOption?->option_text,
                'correct_option' => $a->question->options->firstWhere('is_correct', true)?->option_text,
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

    private function processSubmission(QuizAttempt $attempt, array $answers): void
    {
        DB::transaction(function () use ($attempt, $answers) {
            // Collect valid question IDs
            $validQuestionIds = Question::whereIn('id', $attempt->question_ids ?? [])
                ->pluck('id')
                ->flip();

            foreach ($answers as $questionId => $optionId) {
                $questionId = (int) $questionId;
                $optionId = (int) $optionId;

                if (!$questionId || !$optionId)
                    continue;

                if (!isset($validQuestionIds[$questionId]))
                    continue;

                $option = Option::where('id', $optionId)
                    ->where('question_id', $questionId)
                    ->first();

                if (!$option)
                    continue;

                Answer::updateOrCreate(
                    ['quiz_attempt_id' => $attempt->id, 'question_id' => $questionId],
                    ['selected_option_id' => $optionId, 'is_correct' => $option->is_correct]
                );
            }

            $correct = Answer::where('quiz_attempt_id', $attempt->id)->where('is_correct', true)->count();
            $score = $attempt->total_questions > 0
                ? (int) round(($correct / $attempt->total_questions) * 100)
                : 0;

            $attempt->update([
                'is_submitted' => true,
                'is_timed_out' => $attempt->isExpired(),
                'ended_at' => now(),
                'score' => $score,
                'correct_answers' => $correct,
                'incorrect_answers' => $attempt->total_questions - $correct,
            ]);
        });
    }
}