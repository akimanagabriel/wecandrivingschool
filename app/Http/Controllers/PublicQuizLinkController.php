<?php
/**
 * Public Quiz Link Controller
 * 
 * This controller handles all public quiz functionality including:
 * - Single reusable link for all visitors
 * - 2 free attempts per IP address
 * - Tracking user attempts by IP
 * - Managing quiz sessions, answers, and results
 * - Displaying payment modal after max attempts
 * 
 * Each IP can attempt the quiz twice before being prompted to upgrade.
 * Passing score is 12/20 (60%).
 */

namespace App\Http\Controllers;

use App\Models\PublicQuizLink;
use App\Models\PublicQuizAttempt;
use App\Models\Question;
use App\Models\PricingPlan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Request as RequestFacade;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PublicQuizLinkController extends Controller
{
    // ─── Constants ────────────────────────────────────────────────────────────

    /** Passing score required to pass the quiz (12/20 = 60%) */
    const PASSING_SCORE = 60;

    /** Total number of questions per quiz */
    const TOTAL_QUESTIONS = 20;

    /** Quiz duration in minutes */
    const QUIZ_DURATION_MINUTES = 20;

    // ─── IP Detection ────────────────────────────────────────────────────────

    /**
     * Get the real client IP address
     * Checks various proxy headers to get the actual user IP
     * 
     * @param Request $request The HTTP request
     * @return string The client's real IP address
     */
    private function getClientIp(Request $request): string
    {
        $headers = [
            'HTTP_CLIENT_IP',
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_FORWARDED',
            'HTTP_X_CLUSTER_CLIENT_IP',
            'HTTP_FORWARDED_FOR',
            'HTTP_FORWARDED',
            'REMOTE_ADDR'
        ];

        foreach ($headers as $header) {
            if ($request->server($header)) {
                $ips = explode(',', $request->server($header));
                $ip = trim($ips[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }

        return $request->ip();
    }

    // ─── Link Management ─────────────────────────────────────────────────────

    /**
     * Get the single reusable public quiz link (singleton pattern)
     * This ensures only one link exists for all visitors
     * 
     * @return PublicQuizLink The public quiz link
     */
    private function getLink(): PublicQuizLink
    {
        return PublicQuizLink::firstOrCreate(
            ['name' => 'Free Trial - Public Access'],
            [
                'token' => Str::random(32),
                'description' => 'Free trial quiz with 2 attempts per IP',
                'max_attempts_per_ip' => 2,
                'total_attempts_all_users' => 0,
                'expires_at' => now()->addYears(10),
                'is_active' => true,
                'metadata' => [
                    'created_by' => 'system',
                    'type' => 'public_trial',
                    'version' => '1.0',
                ],
            ]
        );
    }

    // ─── Public Access ────────────────────────────────────────────────────────

    public function access(Request $request, string $token)
    {
        $ip = $this->getClientIp($request);
        $result = $this->validateLink($token, $ip);

        if (!$result['valid']) {
            return Inertia::render('public/link-expired', [
                'token' => $token,
                'message' => $result['message'],
                'code' => $result['code'],
                'link' => $result['link'] ? [
                    'id' => $result['link']->id,
                    'name' => $result['link']->name,
                    'max_attempts_per_ip' => $result['link']->max_attempts_per_ip,
                    'used_count' => $result['link']->total_attempts_all_users,
                ] : null,
                'plans' => $this->getPricingPlans(),
                'showPaymentModal' => in_array($result['code'], ['expired', 'already_used', 'max_attempts_reached']),
                'existingAttempt' => $result['existing_attempt'] ?? null,
                'attemptsCount' => $result['attempts_count'] ?? 0,
                'maxAttemptsPerIp' => $result['max_attempts_per_ip'] ?? 2,
            ]);
        }

        if (isset($result['existing_attempt']) && !$result['existing_attempt']->is_completed) {
            return redirect()->route('public.quiz.take', [
                'token' => $token,
                'attempt' => $result['existing_attempt']->id
            ]);
        }

        if (isset($result['has_completed_attempts']) && $result['has_completed_attempts']) {
            try {
                $attempt = $this->createFreshAttempt($result['link'], $ip, $result['user_name'] ?? 'User');
                $this->initializeQuiz($attempt);
                return redirect()->route('public.quiz.take', [
                    'token' => $token,
                    'attempt' => $attempt->id
                ]);
            } catch (\Exception $e) {
                return back()->with('error', $e->getMessage());
            }
        }

        if (isset($result['needs_name']) && $result['needs_name']) {
            return Inertia::render('public/enter-details', [
                'token' => $token,
                'link' => [
                    'id' => $result['link']->id,
                    'name' => $result['link']->name,
                    'remaining_attempts' => $result['remaining_attempts'],
                    'max_attempts_per_ip' => $result['max_attempts_per_ip'] ?? 2,
                    'attempts_used' => $result['attempts_count'] ?? 0,
                ],
            ]);
        }

        return back()->with('error', 'Unable to process your request.');
    }

    private function validateLink(string $token, string $ip): array
    {
        $link = PublicQuizLink::where('token', $token)->first();

        if (!$link) {
            return [
                'valid' => false,
                'message' => 'This link does not exist.',
                'code' => 'not_found'
            ];
        }

        if (!$link->isValid()) {
            return [
                'valid' => false,
                'message' => $this->getExpirationMessage($link),
                'code' => 'expired',
                'link' => $link
            ];
        }

        $incompleteAttempt = $link->getIncompleteAttempt($ip);
        if ($incompleteAttempt) {
            return [
                'valid' => true,
                'link' => $link,
                'existing_attempt' => $incompleteAttempt,
                'remaining_attempts' => $link->getRemainingAttemptsForIp($ip),
                'user_name' => $incompleteAttempt->user_name,
                'attempts_count' => $link->getCompletedAttemptsCount($ip),
                'max_attempts_per_ip' => $link->max_attempts_per_ip,
            ];
        }

        $completedCount = $link->getCompletedAttemptsCount($ip);

        if ($completedCount >= $link->max_attempts_per_ip) {
            return [
                'valid' => false,
                'message' => "You have reached the maximum of {$link->max_attempts_per_ip} attempts. Upgrade to continue practicing!",
                'code' => 'max_attempts_reached',
                'link' => $link,
                'attempts_count' => $completedCount,
                'max_attempts_per_ip' => $link->max_attempts_per_ip,
                'existing_attempt' => $link->attempts()->where('ip_address', $ip)->latest()->first(),
            ];
        }

        if ($completedCount > 0) {
            $lastAttempt = $link->attempts()
                ->where('ip_address', $ip)
                ->where('is_completed', true)
                ->latest()
                ->first();

            return [
                'valid' => true,
                'link' => $link,
                'has_completed_attempts' => true,
                'user_name' => $lastAttempt?->user_name ?? 'User',
                'user_email' => $lastAttempt?->user_email ?? null,
                'remaining_attempts' => $link->getRemainingAttemptsForIp($ip),
                'attempts_count' => $completedCount,
                'max_attempts_per_ip' => $link->max_attempts_per_ip,
                'remaining_ip_attempts' => $link->getRemainingAttemptsForIp($ip),
            ];
        }

        return [
            'valid' => true,
            'link' => $link,
            'is_new_user' => true,
            'needs_name' => true,
            'remaining_attempts' => $link->max_attempts_per_ip,
            'attempts_count' => 0,
            'max_attempts_per_ip' => $link->max_attempts_per_ip,
            'remaining_ip_attempts' => $link->max_attempts_per_ip,
        ];
    }

    private function createFreshAttempt(PublicQuizLink $link, string $ip, string $userName): PublicQuizAttempt
    {
        $existingAttempt = $link->getIncompleteAttempt($ip);
        if ($existingAttempt) {
            $existingAttempt->delete();
        }

        $lastAttempt = $link->attempts()
            ->where('ip_address', $ip)
            ->where('is_completed', true)
            ->latest()
            ->first();

        $completedCount = $link->getCompletedAttemptsCount($ip);

        return PublicQuizAttempt::create([
            'public_quiz_link_id' => $link->id,
            'ip_address' => $ip,
            'session_id' => Session::getId(),
            'user_agent' => RequestFacade::userAgent(),
            'user_name' => $lastAttempt?->user_name ?? $userName,
            'user_email' => $lastAttempt?->user_email ?? null,
            'attempt_number' => $completedCount + 1,
            'started_at' => now(),
            'expires_at' => now()->addMinutes(self::QUIZ_DURATION_MINUTES),
            'total_questions' => self::TOTAL_QUESTIONS,
            'is_completed' => false,
        ]);
    }

    // ─── User Details ─────────────────────────────────────────────────────────

    public function storeDetails(Request $request, string $token)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $link = PublicQuizLink::where('token', $token)->firstOrFail();
        $ip = $this->getClientIp($request);

        if (!$link->canIpAttempt($ip)) {
            return back()->with('error', "You have already used all {$link->max_attempts_per_ip} attempts.");
        }

        try {
            $attempt = $this->createOrUpdateAttempt($link, $ip, $validated);
            $this->initializeQuiz($attempt);
            return redirect()->route('public.quiz.take', [
                'token' => $token,
                'attempt' => $attempt->id
            ]);
        } catch (\Exception $e) {
            \Log::error('Quiz initialization failed:', [
                'error' => $e->getMessage(),
                'token' => $token,
                'ip' => $ip
            ]);
            return back()->with('error', $e->getMessage());
        }
    }

    private function createOrUpdateAttempt(PublicQuizLink $link, string $ip, array $userData): PublicQuizAttempt
    {
        $attempt = $link->getIncompleteAttempt($ip);

        if ($attempt) {
            $attempt->update([
                'user_name' => $userData['name'],
                'user_email' => $userData['email'] ?? null,
            ]);
            return $attempt;
        }

        $completedCount = $link->getCompletedAttemptsCount($ip);

        return PublicQuizAttempt::create([
            'public_quiz_link_id' => $link->id,
            'ip_address' => $ip,
            'session_id' => Session::getId(),
            'user_agent' => RequestFacade::userAgent(),
            'user_name' => $userData['name'],
            'user_email' => $userData['email'] ?? null,
            'attempt_number' => $completedCount + 1,
            'started_at' => now(),
            'expires_at' => now()->addMinutes(self::QUIZ_DURATION_MINUTES),
            'total_questions' => self::TOTAL_QUESTIONS,
            'is_completed' => false,
        ]);
    }

    /**
     * Initialize a quiz with random questions
     * This method should be called only once when the quiz is first created.
     * It sets the question IDs and the expiry timestamp.
     */
    private function initializeQuiz(PublicQuizAttempt $attempt): void
    {
        $questions = Question::where('is_active', true)
            ->inRandomOrder()
            ->limit(self::TOTAL_QUESTIONS)
            ->get();

        if ($questions->count() < self::TOTAL_QUESTIONS) {
            throw new \Exception('Not enough questions available.');
        }

        $questionIds = $questions->pluck('id')->toArray();

        $attempt->update([
            'question_ids' => $questionIds,
            'total_questions' => $questions->count(),
            'started_at' => now(),
            'expires_at' => now()->addMinutes(self::QUIZ_DURATION_MINUTES),
        ]);

        $link = $attempt->link;
        $link->increment('total_attempts_all_users');
        $link->save();
    }

    // ─── Quiz Taking ──────────────────────────────────────────────────────────

    public function takeQuiz(Request $request, string $token, int $attemptId)
    {
        $link = PublicQuizLink::where('token', $token)->firstOrFail();
        $attempt = PublicQuizAttempt::findOrFail($attemptId);
        $ip = $this->getClientIp($request);

        // Verify ownership
        if ($attempt->public_quiz_link_id !== $link->id || $attempt->ip_address !== $ip) {
            abort(403, 'Unauthorized access to this quiz.');
        }

        if ($attempt->is_completed) {
            return redirect()->route('public.quiz.results', [
                'token' => $token,
                'attempt' => $attempt->id
            ]);
        }

        // ─── Only initialize if questions are not yet set ──────────────────
        // This prevents resetting expires_at on every page refresh.
        if (empty($attempt->question_ids)) {
            try {
                $this->initializeQuiz($attempt);
                $attempt->refresh();
            } catch (\Exception $e) {
                return back()->with('error', $e->getMessage());
            }
        } else {
            // If questions exist but expires_at is missing (edge case), set it now.
            if (empty($attempt->expires_at)) {
                $attempt->update(['expires_at' => now()->addMinutes(self::QUIZ_DURATION_MINUTES)]);
                $attempt->refresh();
            }
        }

        // ─── Get formatted questions ──────────────────────────────────────
        $questions = $this->getQuizQuestions($attempt);

        // ─── Get remaining attempts for this IP ──────────────────────────
        $completedCount = $link->getCompletedAttemptsCount($ip);
        $remainingIpAttempts = max(0, $link->max_attempts_per_ip - $completedCount);

        // ─── Calculate remaining seconds using expires_at ────────────────
        $remainingSeconds = $attempt->expires_at
            ? max(0, now()->diffInSeconds($attempt->expires_at, false))
            : self::QUIZ_DURATION_MINUTES * 60;

        return Inertia::render('public/quiz', [
            'token' => $token,
            'attempt' => [
                'id' => $attempt->id,
                'totalQuestions' => $attempt->total_questions,
                'userName' => $attempt->user_name,
                'startedAt' => $attempt->started_at,
                'attemptNumber' => $attempt->attempt_number,
                'maxAttempts' => $link->max_attempts_per_ip,
                'passingScore' => self::PASSING_SCORE,
                'remainingSeconds' => $remainingSeconds,
            ],
            'questions' => $questions,
            'savedAnswers' => $attempt->answers ?? [],
            'remainingAttempts' => $link->total_attempts_all_users,
            'remainingIpAttempts' => $remainingIpAttempts,
            'maxAttemptsPerIp' => $link->max_attempts_per_ip,
        ]);
    }

    private function getQuizQuestions(PublicQuizAttempt $attempt): array
    {
        $questionIds = $attempt->question_ids ?? [];
        if (empty($questionIds)) {
            return [];
        }

        return Question::with(['options', 'category'])
            ->whereIn('id', $questionIds)
            ->get()
            ->map(function ($q) {
                return [
                    'id' => $q->id,
                    'question_text' => $q->question_text,
                    'image_path' => $q->image_path,
                    'category' => $q->category?->name,
                    'options' => $q->options->map(function ($o) {
                        return [
                            'id' => $o->id,
                            'option_text' => $o->option_text,
                            'image_path' => $o->image_path,
                        ];
                    }),
                ];
            })
            ->toArray();
    }

    // ─── Save Answer ──────────────────────────────────────────────────────────

    public function saveAnswer(Request $request, string $token, int $attemptId)
    {
        $validated = $request->validate([
            'question_id' => 'required|integer',
            'option_id' => 'required|integer',
        ]);

        $attempt = PublicQuizAttempt::findOrFail($attemptId);
        $ip = $this->getClientIp($request);

        if ($attempt->ip_address !== $ip) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        if ($attempt->is_completed) {
            return response()->json(['error' => 'Quiz already completed'], 422);
        }

        $answers = $attempt->answers ?? [];
        $answers[$validated['question_id']] = $validated['option_id'];
        $attempt->update(['answers' => $answers]);

        return response()->json(['success' => true]);
    }

    // ─── Submit Quiz ──────────────────────────────────────────────────────────

    public function submitQuiz(Request $request, string $token, int $attemptId)
    {
        $attempt = PublicQuizAttempt::findOrFail($attemptId);
        $ip = $this->getClientIp($request);

        if ($attempt->ip_address !== $ip) {
            abort(403, 'Unauthorized access.');
        }

        if ($attempt->is_completed) {
            return redirect()->route('public.quiz.results', [
                'token' => $token,
                'attempt' => $attempt->id
            ]);
        }

        $submittedAnswers = $request->input('answers', []);
        if (empty($submittedAnswers)) {
            return back()->with('error', 'No answers to submit.');
        }

        $this->gradeQuiz($attempt, $submittedAnswers);
        return redirect()->route('public.quiz.results', [
            'token' => $token,
            'attempt' => $attempt->id
        ]);
    }

    private function gradeQuiz(PublicQuizAttempt $attempt, array $submittedAnswers): void
    {
        $questionIds = $attempt->question_ids ?? [];
        $correct = 0;
        $incorrect = 0;

        foreach ($submittedAnswers as $questionId => $optionId) {
            if (!is_numeric($questionId) || !is_numeric($optionId)) {
                continue;
            }
            $questionId = (int) $questionId;
            $optionId = (int) $optionId;

            if (!in_array($questionId, $questionIds)) {
                continue;
            }

            $question = Question::find($questionId);
            if (!$question)
                continue;

            $option = $question->options()->find($optionId);
            $isCorrect = $option && $option->is_correct;

            if ($isCorrect) {
                $correct++;
            } else {
                $incorrect++;
            }
        }

        $total = $attempt->total_questions;
        $score = $total > 0 ? round(($correct / $total) * 100) : 0;
        $isPassed = $score >= self::PASSING_SCORE;

        $attempt->update([
            'score' => $score,
            'correct_answers' => $correct,
            'incorrect_answers' => $incorrect,
            'is_completed' => true,
            'is_passed' => $isPassed,
            'completed_at' => now(),
            'answers' => $submittedAnswers,
        ]);
    }

    // ─── Results ──────────────────────────────────────────────────────────────

    public function results(Request $request, string $token, int $attemptId)
    {
        $link = PublicQuizLink::where('token', $token)->firstOrFail();
        $attempt = PublicQuizAttempt::findOrFail($attemptId);
        $ip = $this->getClientIp($request);

        if ($attempt->public_quiz_link_id !== $link->id || $attempt->ip_address !== $ip) {
            abort(403, 'Unauthorized access.');
        }

        $results = $this->getDetailedResults($attempt);
        $completedAttempts = $link->getCompletedAttemptsByIp($ip);
        $completedCount = $completedAttempts->count();
        $remainingIpAttempts = max(0, $link->max_attempts_per_ip - $completedCount);
        $hasRemainingAttempts = $remainingIpAttempts > 0;

        $attemptHistory = $completedAttempts->map(fn($a) => [
            'score' => $a->score,
            'is_passed' => $a->is_passed,
            'completed_at' => $a->completed_at,
            'correct' => $a->correct_answers,
            'total' => $a->total_questions,
        ]);

        return Inertia::render('public/results', [
            'token' => $token,
            'attempt' => [
                'id' => $attempt->id,
                'score' => $attempt->score,
                'correct_answers' => $attempt->correct_answers,
                'incorrect_answers' => $attempt->incorrect_answers,
                'total_questions' => $attempt->total_questions,
                'is_passed' => $attempt->is_passed,
                'user_name' => $attempt->user_name,
                'completed_at' => $attempt->completed_at,
                'attempt_number' => $attempt->attempt_number,
                'max_attempts' => $link->max_attempts_per_ip,
                'passing_score' => self::PASSING_SCORE,
                'passing_required' => '12 out of 20',
            ],
            'answers' => $results,
            'link' => [
                'id' => $link->id,
                'name' => $link->name,
                'max_attempts_per_ip' => $link->max_attempts_per_ip,
            ],
            'plans' => $this->getPricingPlans(),
            'showUpgradeModal' => !$hasRemainingAttempts,
            'remainingIpAttempts' => $remainingIpAttempts,
            'maxAttemptsPerIp' => $link->max_attempts_per_ip,
            'hasRemainingAttempts' => $hasRemainingAttempts,
            'attemptHistory' => $attemptHistory,
            'canTryAgain' => $hasRemainingAttempts,
        ]);
    }

    private function getDetailedResults(PublicQuizAttempt $attempt): array
    {
        $questionIds = $attempt->question_ids ?? [];
        $answers = $attempt->answers ?? [];
        $results = [];

        foreach ($questionIds as $questionId) {
            $question = Question::with(['options', 'category'])->find($questionId);
            if (!$question)
                continue;

            $selectedOptionId = $answers[$questionId] ?? null;
            $selectedOption = $question->options()->find($selectedOptionId);
            $correctOption = $question->options()->where('is_correct', true)->first();

            $results[] = [
                'question_id' => $question->id,
                'question_text' => $question->question_text,
                'image_path' => $question->image_path,
                'category' => $question->category?->name,
                'explanation' => $question->explanation,
                'is_correct' => $selectedOption && $selectedOption->is_correct,
                'selected_option' => $selectedOption?->option_text,
                'selected_option_image' => $selectedOption?->image_path,
                'correct_option' => $correctOption?->option_text,
                'correct_option_image' => $correctOption?->image_path,
                'all_options' => $question->options->map(function ($o) {
                    return [
                        'id' => $o->id,
                        'text' => $o->option_text,
                        'image_path' => $o->image_path,
                        'is_correct' => $o->is_correct,
                    ];
                }),
            ];
        }

        return $results;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private function getExpirationMessage(PublicQuizLink $link): string
    {
        if (!$link->is_active) {
            return 'This link has been deactivated.';
        }

        if ($link->expires_at && $link->expires_at->isPast()) {
            return 'This link has expired.';
        }

        return 'This link is no longer valid.';
    }

    private function getPricingPlans(): array
    {
        return PricingPlan::active()
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'description' => $p->description,
                'amount' => $p->amount,
                'currency' => $p->currency,
                'duration_days' => $p->duration_days,
                'duration_label' => $p->duration_label,
                'features' => $p->features ?? [],
                'badge_label' => $p->badge_label,
                'is_featured' => $p->is_featured,
            ])
            ->toArray();
    }
}