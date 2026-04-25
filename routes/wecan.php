<?php

use App\Http\Controllers\Admin;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\Admin\PricingPlanController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\StudentDashboardController;
use Illuminate\Support\Facades\Route;

// ── Student routes ─────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:student|admin'])->group(function () {

    Route::get('student/dashboard', [StudentDashboardController::class, 'index'])->name('student.dashboard');

    // Payments
    Route::get('student/payment', [PaymentController::class, 'index'])->name('student.payment');
    Route::post('student/payment/momo', [PaymentController::class, 'initiateMomo'])->name('student.payment.momo');
    Route::get('student/payment/success/{payment}', [PaymentController::class, 'success'])->name('student.payment.success');

    // Quiz
    Route::post('quiz/start', [QuizController::class, 'start'])->name('quiz.start');
    Route::get('quiz/{attempt}', [QuizController::class, 'take'])->name('quiz.take');
    Route::post('quiz/{attempt}/answer', [QuizController::class, 'saveAnswer'])->name('quiz.answer');
    Route::post('quiz/{attempt}/submit', [QuizController::class, 'submit'])->name('quiz.submit');
    Route::get('quiz/{attempt}/results', [QuizController::class, 'results'])->name('quiz.results');
});

// ── ITEC Payment webhook (no auth — signed by ITEC key) ───────────────────
Route::post('webhooks/itec/payment', [PaymentController::class, 'webhook'])->name('webhooks.itec.payment');

// ── Admin routes ───────────────────────────────────────────────────────────
Route::middleware(['auth', 'verified', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    Route::get('/', [Admin\DashboardController::class, 'index'])->name('dashboard');

    // Questions
    Route::get('questions', [Admin\QuestionController::class, 'index'])->name('questions.index');
    Route::get('questions/create', [Admin\QuestionController::class, 'create'])->name('questions.create');
    Route::post('questions', [Admin\QuestionController::class, 'store'])->name('questions.store');
    Route::get('questions/{question}/edit', [Admin\QuestionController::class, 'edit'])->name('questions.edit');
    Route::put('questions/{question}', [Admin\QuestionController::class, 'update'])->name('questions.update');
    Route::post('questions/{question}', [Admin\QuestionController::class, 'update'])->name('questions.update.post');
    Route::delete('questions/{question}', [Admin\QuestionController::class, 'destroy'])->name('questions.destroy');

    // Users
    Route::get('users', [Admin\UserController::class, 'index'])->name('users.index');
    Route::get('users/{user}', [Admin\UserController::class, 'show'])->name('users.show');
    Route::post('users/{user}/toggle-access', [Admin\UserController::class, 'toggleAccess'])->name('users.toggle-access');
    Route::post('users/{user}/assign-role', [Admin\UserController::class, 'assignRole'])->name('users.assign-role');
    Route::delete('users/{user}', [Admin\UserController::class, 'destroy'])->name('users.destroy');

    // Payments
    Route::get('payments', [Admin\PaymentController::class, 'index'])->name('payments.index');
    Route::post('payments/{payment}/refund', [Admin\PaymentController::class, 'refund'])->name('payments.refund');

    // Pricing Plans
    Route::get('pricing-plans', [PricingPlanController::class, 'index'])->name('pricing-plans.index');
    Route::post('pricing-plans', [PricingPlanController::class, 'store'])->name('pricing-plans.store');
    Route::put('pricing-plans/{pricingPlan}', [PricingPlanController::class, 'update'])->name('pricing-plans.update');
    Route::delete('pricing-plans/{pricingPlan}', [PricingPlanController::class, 'destroy'])->name('pricing-plans.destroy');
    Route::post('pricing-plans/{pricingPlan}/toggle', [PricingPlanController::class, 'toggleActive'])->name('pricing-plans.toggle');
});
