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
        // List of headers that may contain the real client IP
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

    /**
     * Main entry point for public quiz access
     * Validates the link and determines what to show the user
     * 
     * @param Request $request The HTTP request
     * @param string $token The unique link token
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function access(Request $request, string $token)
    {
        // Get the client's real IP address
        $ip = $this->getClientIp($request);

        // Validate the link and check user eligibility
        $result = $this->validateLink($token, $ip);

        // ─── Link is invalid - show expired page ───
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

        // ─── User has an existing incomplete attempt - resume it ───
        if (isset($result['existing_attempt']) && !$result['existing_attempt']->is_completed) {
            return redirect()->route('public.quiz.take', [
                'token' => $token,
                'attempt' => $result['existing_attempt']->id
            ]);
        }

        // ─── User has completed attempts but still has remaining attempts ───
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

        // ─── New user - show name form ───
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

    /**
     * Validate the link and check user's eligibility
     * Determines if user can take the quiz based on their attempt history
     * 
     * @param string $token The link token
     * @param string $ip The client IP address
     * @return array Validation result with link data and user status
     */
    private function validateLink(string $token, string $ip): array
    {
        // ─── Find the link ───
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

        // ─── Check for incomplete attempt first ───
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

        // ─── Get completed attempts count ───
        $completedCount = $link->getCompletedAttemptsCount($ip);

        // ─── Check if user has reached max attempts ───
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

        // ─── User has completed attempts but still has remaining attempts ───
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

        // ─── New user - no attempts yet ───
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

    /**
     * Create a fresh attempt for returning users
     * Copies user details from their previous attempt
     * 
     * @param PublicQuizLink $link The quiz link
     * @param string $ip The client IP
     * @param string $userName The user's name
     * @return PublicQuizAttempt The new attempt
     */
    private function createFreshAttempt(PublicQuizLink $link, string $ip, string $userName): PublicQuizAttempt
    {
        // Delete any existing incomplete attempt
        $existingAttempt = $link->getIncompleteAttempt($ip);
        if ($existingAttempt) {
            $existingAttempt->delete();
        }

        // Get the last completed attempt to copy user details
        $lastAttempt = $link->attempts()
            ->where('ip_address', $ip)
            ->where('is_completed', true)
            ->latest()
            ->first();

        // Get completed attempts count for attempt number
        $completedCount = $link->getCompletedAttemptsCount($ip);

        // Create fresh attempt
        return PublicQuizAttempt::create([
            'public_quiz_link_id' => $link->id,
            'ip_address' => $ip,
            'session_id' => Session::getId(),
            'user_agent' => RequestFacade::userAgent(),
            'user_name' => $lastAttempt?->user_name ?? $userName,
            'user_email' => $lastAttempt?->user_email ?? null,
            'attempt_number' => $completedCount + 1,
            'started_at' => now(),
            'total_questions' => self::TOTAL_QUESTIONS,
            'is_completed' => false,
        ]);
    }

    // ─── User Details ─────────────────────────────────────────────────────────

    /**
     * Store user details and start the quiz
     * Called when a new user submits the name form
     * 
     * @param Request $request The HTTP request
     * @param string $token The link token
     * @return \Illuminate\Http\RedirectResponse
     */
    public function storeDetails(Request $request, string $token)
    {
        // Validate user input
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'nullable|email|max:255',
        ]);

        $link = PublicQuizLink::where('token', $token)->firstOrFail();
        $ip = $this->getClientIp($request);

        // Check if user has already used all attempts
        if (!$link->canIpAttempt($ip)) {
            return back()->with('error', "You have already used all {$link->max_attempts_per_ip} attempts.");
        }

        try {
            // Create or update the attempt with user details
            $attempt = $this->createOrUpdateAttempt($link, $ip, $validated);

            // Initialize quiz with random questions
            $this->initializeQuiz($attempt);

            // Redirect to the quiz take page
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

    /**
     * Create or update a quiz attempt with user details
     * 
     * @param PublicQuizLink $link The quiz link
     * @param string $ip The client IP
     * @param array $userData The user's name and email
     * @return PublicQuizAttempt The attempt
     */
    private function createOrUpdateAttempt(PublicQuizLink $link, string $ip, array $userData): PublicQuizAttempt
    {
        // Check for existing incomplete attempt
        $attempt = $link->getIncompleteAttempt($ip);

        if ($attempt) {
            // Update existing attempt with user details
            $attempt->update([
                'user_name' => $userData['name'],
                'user_email' => $userData['email'] ?? null,
            ]);
            return $attempt;
        }

        // Get completed attempts count for attempt number
        $completedCount = $link->getCompletedAttemptsCount($ip);

        // Create new attempt
        return PublicQuizAttempt::create([
            'public_quiz_link_id' => $link->id,
            'ip_address' => $ip,
            'session_id' => Session::getId(),
            'user_agent' => RequestFacade::userAgent(),
            'user_name' => $userData['name'],
            'user_email' => $userData['email'] ?? null,
            'attempt_number' => $completedCount + 1,
            'started_at' => now(),
            'total_questions' => self::TOTAL_QUESTIONS,
            'is_completed' => false,
        ]);
    }

    /**
     * Initialize a quiz with random questions
     * Selects 20 random active questions and stores them in the attempt
     * 
     * @param PublicQuizAttempt $attempt The quiz attempt
     * @throws \Exception If not enough questions are available
     */
    private function initializeQuiz(PublicQuizAttempt $attempt): void
    {
        // Get 20 random active questions
        $questions = Question::where('is_active', true)
            ->inRandomOrder()
            ->limit(self::TOTAL_QUESTIONS)
            ->get();

        if ($questions->count() < self::TOTAL_QUESTIONS) {
            throw new \Exception('Not enough questions available.');
        }

        // Store question IDs in the attempt
        $questionIds = $questions->pluck('id')->toArray();

        $attempt->update([
            'question_ids' => $questionIds,
            'total_questions' => $questions->count(),
            'started_at' => now(),
        ]);

        // Increment the link's total usage counter
        $link = $attempt->link;
        $link->increment('total_attempts_all_users');
        $link->save();
    }

    // ─── Quiz Taking ──────────────────────────────────────────────────────────

    /**
     * Take the quiz
     * Displays the quiz page with all questions
     * 
     * @param Request $request The HTTP request
     * @param string $token The link token
     * @param int $attemptId The attempt ID
     * @return \Inertia\Response|\Illuminate\Http\RedirectResponse
     */
    public function takeQuiz(Request $request, string $token, int $attemptId)
    {
        $link = PublicQuizLink::where('token', $token)->firstOrFail();
        $attempt = PublicQuizAttempt::findOrFail($attemptId);
        $ip = $this->getClientIp($request);

        // Verify ownership - ensure this attempt belongs to this IP
        if ($attempt->public_quiz_link_id !== $link->id || $attempt->ip_address !== $ip) {
            abort(403, 'Unauthorized access to this quiz.');
        }

        // If completed, redirect to results
        if ($attempt->is_completed) {
            return redirect()->route('public.quiz.results', [
                'token' => $token,
                'attempt' => $attempt->id
            ]);
        }

        // If no questions, initialize
        if (empty($attempt->question_ids)) {
            try {
                $this->initializeQuiz($attempt);
                $attempt->refresh();
            } catch (\Exception $e) {
                return back()->with('error', $e->getMessage());
            }
        }

        // Get formatted questions for display
        $questions = $this->getQuizQuestions($attempt);

        // Get remaining attempts for this IP
        $completedCount = $link->getCompletedAttemptsCount($ip);
        $remainingIpAttempts = max(0, $link->max_attempts_per_ip - $completedCount);

        // Render the quiz page
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
            ],
            'questions' => $questions,
            'savedAnswers' => $attempt->answers ?? [],
            'remainingAttempts' => $link->total_attempts_all_users,
            'remainingIpAttempts' => $remainingIpAttempts,
            'maxAttemptsPerIp' => $link->max_attempts_per_ip,
        ]);
    }

    /**
     * Get formatted questions for the quiz
     * 
     * @param PublicQuizAttempt $attempt The quiz attempt
     * @return array Formatted questions with options
     */
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

    /**
     * Save a single answer
     * Called via AJAX when user selects an option
     * 
     * @param Request $request The HTTP request
     * @param string $token The link token
     * @param int $attemptId The attempt ID
     * @return \Illuminate\Http\JsonResponse
     */
    public function saveAnswer(Request $request, string $token, int $attemptId)
    {
        // Validate the request
        $validated = $request->validate([
            'question_id' => 'required|integer',
            'option_id' => 'required|integer',
        ]);

        $attempt = PublicQuizAttempt::findOrFail($attemptId);
        $ip = $this->getClientIp($request);

        // Verify the attempt belongs to this IP
        if ($attempt->ip_address !== $ip) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // Check if quiz is already completed
        if ($attempt->is_completed) {
            return response()->json(['error' => 'Quiz already completed'], 422);
        }

        // Save the answer
        $answers = $attempt->answers ?? [];
        $answers[$validated['question_id']] = $validated['option_id'];
        $attempt->update(['answers' => $answers]);

    }

    // ─── Submit Quiz ──────────────────────────────────────────────────────────

    /**
     * Submit the quiz
     * Grades the quiz and redirects to results
     * 
     * @param Request $request The HTTP request
     * @param string $token The link token
     * @param int $attemptId The attempt ID
     * @return \Illuminate\Http\RedirectResponse
     */
    public function submitQuiz(Request $request, string $token, int $attemptId)
    {
        $attempt = PublicQuizAttempt::findOrFail($attemptId);
        $ip = $this->getClientIp($request);

        // Verify ownership
        if ($attempt->ip_address !== $ip) {
            abort(403, 'Unauthorized access.');
        }

        // If already completed, redirect to results
        if ($attempt->is_completed) {
            return redirect()->route('public.quiz.results', [
                'token' => $token,
                'attempt' => $attempt->id
            ]);
        }

        // Get submitted answers
        $submittedAnswers = $request->input('answers', []);

        if (empty($submittedAnswers)) {
            return back()->with('error', 'No answers to submit.');
        }

        // Grade the quiz
        $this->gradeQuiz($attempt, $submittedAnswers);

        // Redirect to results page
        return redirect()->route('public.quiz.results', [
            'token' => $token,
            'attempt' => $attempt->id
        ]);
    }

    /**
     * Grade the quiz and calculate results
     * Passing score is 12/20 (60%)
     * 
     * @param PublicQuizAttempt $attempt The quiz attempt
     * @param array $submittedAnswers The user's answers
     */
    private function gradeQuiz(PublicQuizAttempt $attempt, array $submittedAnswers): void
    {
        $questionIds = $attempt->question_ids ?? [];
        $correct = 0;
        $incorrect = 0;

        // Grade each answer
        foreach ($submittedAnswers as $questionId => $optionId) {
            // Skip invalid entries
            if (!is_numeric($questionId) || !is_numeric($optionId)) {
                continue;
            }

            $questionId = (int) $questionId;
            $optionId = (int) $optionId;

            // Skip if question not in this quiz
            if (!in_array($questionId, $questionIds)) {
                continue;
            }

            // Check if the answer is correct
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

        // Calculate score as percentage
        $score = $total > 0 ? round(($correct / $total) * 100) : 0;

        // Pass if score >= 60% (12/20)
        $isPassed = $score >= self::PASSING_SCORE;

        // Update the attempt with results
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

    /**
     * Show quiz results
     * Displays score, correct/incorrect answers, and upgrade modal if needed
     * 
     * @param Request $request The HTTP request
     * @param string $token The link token
     * @param int $attemptId The attempt ID
     * @return \Inertia\Response
     */
    public function results(Request $request, string $token, int $attemptId)
    {
        $link = PublicQuizLink::where('token', $token)->firstOrFail();
        $attempt = PublicQuizAttempt::findOrFail($attemptId);
        $ip = $this->getClientIp($request);

        // Verify ownership
        if ($attempt->public_quiz_link_id !== $link->id || $attempt->ip_address !== $ip) {
            abort(403, 'Unauthorized access.');
        }

        // Get detailed results for each question
        $results = $this->getDetailedResults($attempt);

        // Get all completed attempts for this IP
        $completedAttempts = $link->getCompletedAttemptsByIp($ip);
        $completedCount = $completedAttempts->count();
        $remainingIpAttempts = max(0, $link->max_attempts_per_ip - $completedCount);
        $hasRemainingAttempts = $remainingIpAttempts > 0;

        // Build attempt history
        $attemptHistory = $completedAttempts->map(fn($a) => [
            'score' => $a->score,
            'is_passed' => $a->is_passed,
            'completed_at' => $a->completed_at,
            'correct' => $a->correct_answers,
            'total' => $a->total_questions,
        ]);

        // Render results page
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

    /**
     * Get detailed results with correct/incorrect answers
     * 
     * @param PublicQuizAttempt $attempt The quiz attempt
     * @return array Detailed results for each question
     */
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

    /**
     * Get expiration message based on link state
     * 
     * @param PublicQuizLink $link The quiz link
     * @return string The expiration message
     */
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

    /**
     * Get pricing plans for the payment modal
     * 
     * @return array List of active pricing plans
     */
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