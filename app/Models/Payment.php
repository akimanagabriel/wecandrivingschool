<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'amount',
        'currency',
        'payment_method',
        'status',
        'transaction_id',
        'reference',
        'metadata',
        'access_duration_days',
        'paid_at',
        'access_expires_at',
    ];

    protected $casts = [
        'paid_at'           => 'datetime',
        'access_expires_at' => 'datetime',
        'metadata'          => 'array',
        'amount'            => 'decimal:2',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isActive(): bool
    {
        return $this->isCompleted() &&
               ($this->access_expires_at === null || $this->access_expires_at->isFuture());
    }
}
