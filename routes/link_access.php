<?php
use App\Http\Controllers\SharedAccessController;
use App\Http\Controllers\Admin\SharedAccessLinkController;

// Guest/Shared access routes (no auth required)
Route::prefix('shared')->name('shared.')->group(function () {
    Route::get('/access/{token}', [SharedAccessController::class, 'access'])->name('access');
    Route::get('/quiz/{token}/start', [SharedAccessController::class, 'startQuiz'])->name('quiz.start');
    Route::get('/quiz/{token}/take/{attempt}', [SharedAccessController::class, 'takeQuiz'])->name('quiz.take');
    Route::post('/quiz/{token}/submit/{attempt}', [SharedAccessController::class, 'submitQuiz'])->name('quiz.submit');
    Route::get('/quiz/{token}/results/{attempt}', [SharedAccessController::class, 'results'])->name('quiz.results');
});

// Admin routes for managing shared links
Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::resource('shared-links', SharedAccessLinkController::class)->except(['show']);
    Route::post('/shared-links/{sharedAccessLink}/toggle-active', [SharedAccessLinkController::class, 'toggleActive'])->name('shared-links.toggle-active');
    Route::post('/shared-links/{sharedAccessLink}/regenerate-token', [SharedAccessLinkController::class, 'regenerateToken'])->name('shared-links.regenerate-token');
    Route::get('/shared-links/{sharedAccessLink}/stats', [SharedAccessLinkController::class, 'stats'])->name('shared-links.stats');
});

