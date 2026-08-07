<?php

use App\Http\Controllers\PublicQuizLinkController;
use App\Http\Controllers\WelcomeController;

// ─── Welcome Page ───
Route::get('/', [WelcomeController::class, 'index'])->name('home');

// ─── Public Quiz Routes ───
Route::prefix('public/quiz')->name('public.quiz.')->group(function () {
    Route::get('/access/{token}', [PublicQuizLinkController::class, 'access'])->name('access');
    Route::post('/{token}/details', [PublicQuizLinkController::class, 'storeDetails'])->name('details');
    Route::get('/{token}/take/{attempt}', [PublicQuizLinkController::class, 'takeQuiz'])->name('take');
    Route::post('/{token}/take/{attempt}/save', [PublicQuizLinkController::class, 'saveAnswer'])->name('save');
    Route::post('/{token}/take/{attempt}/submit', [PublicQuizLinkController::class, 'submitQuiz'])->name('submit');
    Route::get('/{token}/results/{attempt}', [PublicQuizLinkController::class, 'results'])->name('results');
});