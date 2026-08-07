<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\WelcomeController;

// welcome page
Route::get('/', [WelcomeController::class, 'index'])->name('home');

// authenticated user dashboard
Route::middleware(['auth', 'verified'])->group(function () {
    // Default dashboard redirects based on role
    Route::get('dashboard', function () {
        $user = Auth::user();
        if ($user && $user->hasRole('admin')) {
            return redirect()->route('admin.dashboard');
        }
        return redirect()->route('student.dashboard');
    })->name('dashboard');
});

require __DIR__ . '/settings.php';
require __DIR__ . '/wecan.php';
require __DIR__ . '/link_access.php';
require __DIR__ . '/public_quiz_link.php';
