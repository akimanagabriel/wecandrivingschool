<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Question;
use App\Models\QuizAttempt;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $totalStudents = User::role('student')->count();
        $totalQuestions = Question::where('is_active', true)->count();
        $totalAttempts = QuizAttempt::where('is_submitted', true)->count();
        $totalRevenue = Payment::where('status', 'completed')->sum('amount');
        $passRate = $totalAttempts > 0
            ? round(QuizAttempt::where('is_submitted', true)->where('score', '>=', 70)->count() / $totalAttempts * 100, 1)
            : 0;

        $monthlyRevenue = Payment::where('status', 'completed')
            ->where('paid_at', '>=', now()->subMonths(6))
            ->groupBy(DB::raw("strftime('%Y-%m', paid_at)"))
            ->selectRaw("strftime('%Y-%m', paid_at) as month, SUM(amount) as total")
            ->orderBy('month')
            ->get();

        $hardestQuestions = Question::withCount([
            'answers',
            'answers as wrong_count' => fn($q) => $q->where('is_correct', false),
        ])
            ->groupBy('questions.id')
            ->having('answers_count', '>', 5)
            ->orderByDesc('wrong_count')
            ->limit(5)
            ->get()
            ->map(fn($q) => [
                'id' => $q->id,
                'question' => Str::limit($q->question_text, 60),
                'fail_rate' => $q->failRate(),
                'total_answers' => $q->answers_count,
            ]);

        $recentPayments = Payment::with('user')
            ->latest()
            ->take(8)
            ->get()
            ->map(fn($p) => [
                'id' => $p->id,
                'user' => $p->user->name,
                'amount' => $p->amount,
                'method' => $p->payment_method,
                'status' => $p->status,
                'date' => $p->paid_at ?? $p->created_at,
            ]);

        return Inertia::render('admin/dashboard', [
            'stats' => [
                'totalStudents' => $totalStudents,
                'totalQuestions' => $totalQuestions,
                'totalAttempts' => $totalAttempts,
                'totalRevenue' => $totalRevenue,
                'passRate' => $passRate,
            ],
            'monthlyRevenue' => $monthlyRevenue,
            'hardestQuestions' => $hardestQuestions,
            'recentPayments' => $recentPayments,
        ]);
    }
}