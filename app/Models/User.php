<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'is_active',
        'has_paid_access',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'is_active'         => 'boolean',
        'has_paid_access'   => 'boolean',
    ];

    // ─── Relationships ────────────────────────────────────────────────────────

    public function quizAttempts()
    {
        return $this->hasMany(QuizAttempt::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    public function hasActiveAccess(): bool
    {
        if ($this->has_paid_access) {
            return true;
        }

        // Check if there's a valid completed payment that hasn't expired
        return $this->payments()
            ->where('status', 'completed')
            ->where(function ($query) {
                $query->whereNull('access_expires_at')
                      ->orWhere('access_expires_at', '>', now());
            })
            ->exists();
    }

    public function latestAttempt()
    {
        return $this->hasOne(QuizAttempt::class)->latestOfMany();
    }

    public function passRate(): float
    {
        $submitted = $this->quizAttempts()->where('is_submitted', true)->count();
        if ($submitted === 0) {
            return 0.0;
        }
        $passed = $this->quizAttempts()
            ->where('is_submitted', true)
            ->where('score', '>=', 70)
            ->count();

        return round(($passed / $submitted) * 100, 1);
    }
}
