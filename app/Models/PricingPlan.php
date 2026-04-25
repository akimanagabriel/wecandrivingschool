<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PricingPlan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'amount',
        'currency',
        'duration_days',
        'duration_label',
        'features',
        'badge_label',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'features'    => 'array',
        'is_featured' => 'boolean',
        'is_active'   => 'boolean',
        'amount'      => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }

    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount) . ' ' . $this->currency;
    }
}
