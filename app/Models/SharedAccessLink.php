<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class SharedAccessLink extends Model
{
    use HasFactory;

    protected $fillable = [
        'token',
        'name',
        'max_uses',
        'used_count',
        'expires_at',
        'last_used_at',
        'metadata',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
        'metadata' => 'array',
        'is_active' => 'boolean',
        'max_uses' => 'integer',
        'used_count' => 'integer',
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

    // Relationships
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function sessions()
    {
        return $this->hasMany(SharedAccessSession::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)
            ->where(function ($q) {
                $q->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->whereRaw('used_count < max_uses');
    }

    public function scopeExpired($query)
    {
        return $query->where(function ($q) {
            $q->where('is_active', false)
                ->orWhere('expires_at', '<=', now())
                ->orWhereRaw('used_count >= max_uses');
        });
    }

    // Helper methods
    public function isValid(): bool
    {
        if (!$this->is_active)
            return false;

        if ($this->expires_at && $this->expires_at->isPast())
            return false;

        if ($this->used_count >= $this->max_uses)
            return false;

        return true;
    }

    public function getRemainingUses(): int
    {
        return max(0, $this->max_uses - $this->used_count);
    }

    public function isExpired(): bool
    {
        return !$this->isValid();
    }

    public function incrementUsage(): void
    {
        $this->increment('used_count');
        $this->update(['last_used_at' => now()]);
    }

    public function getFullUrl(): string
    {
        return route('shared.access', ['token' => $this->token]);
    }

    public function getShortenedUrl(): string
    {
        // You can integrate with URL shortener service here
        return $this->getFullUrl();
    }
}