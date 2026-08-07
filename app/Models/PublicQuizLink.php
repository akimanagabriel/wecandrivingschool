<?php
/**
 * Public Quiz Link Model
 * 
 * Represents the single reusable public quiz link.
 * All visitors use the same link but are tracked by IP.
 */

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class PublicQuizLink extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'token',
        'name',
        'description',
        'max_attempts_per_ip',
        'total_attempts_all_users',
        'expires_at',
        'is_active',
        'metadata',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'is_active' => 'boolean',
        'metadata' => 'array',
        'max_attempts_per_ip' => 'integer',
        'total_attempts_all_users' => 'integer',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!$model->token) {
                $model->token = Str::random(32);
            }
        });
    }

    public function attempts()
    {
        return $this->hasMany(PublicQuizAttempt::class);
    }

    public function getFullUrl(): string
    {
        return route('public.quiz.access', ['token' => $this->token]);
    }

    public function isValid(): bool
    {
        if (!$this->is_active) {
            return false;
        }
        if ($this->expires_at && $this->expires_at->isPast()) {
            return false;
        }
        return true;
    }

    public function getCompletedAttemptsByIp(string $ip)
    {
        return $this->attempts()
            ->where('ip_address', $ip)
            ->where('is_completed', true)
            ->get();
    }

    public function getCompletedAttemptsCount(string $ip): int
    {
        return $this->getCompletedAttemptsByIp($ip)->count();
    }

    public function canIpAttempt(string $ip): bool
    {
        return $this->getCompletedAttemptsCount($ip) < $this->max_attempts_per_ip;
    }

    public function getRemainingAttemptsForIp(string $ip): int
    {
        return max(0, $this->max_attempts_per_ip - $this->getCompletedAttemptsCount($ip));
    }

    public function getIncompleteAttempt(string $ip): ?PublicQuizAttempt
    {
        return $this->attempts()
            ->where('ip_address', $ip)
            ->where('is_completed', false)
            ->first();
    }

    public function getOrCreateAttempt(string $ip): ?PublicQuizAttempt
    {
        // Check for existing incomplete attempt
        $attempt = $this->getIncompleteAttempt($ip);
        if ($attempt) {
            return $attempt;
        }

        // Check if IP can create a new attempt
        if (!$this->canIpAttempt($ip)) {
            return null;
        }

        // Create new attempt
        return PublicQuizAttempt::create([
            'public_quiz_link_id' => $this->id,
            'ip_address' => $ip,
            'attempt_number' => $this->getCompletedAttemptsCount($ip) + 1,
            'started_at' => now(),
            'total_questions' => 20,
            'is_completed' => false,
        ]);
    }

    public static function getSingleLink(): self
    {
        return self::firstOrCreate(
            ['name' => 'Free Trial - Public Access'],
            [
                'token' => Str::random(32),
                'description' => 'Free trial quiz with 2 attempts per IP',
                'max_attempts_per_ip' => 2,
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
}