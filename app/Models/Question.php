<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id',
        'question_text',
        'image_path',
        'difficulty',
        'explanation',
        'explanation_audio_path',
        'is_active',
    ];

    protected $casts = ['is_active' => 'boolean'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function options()
    {
        return $this->hasMany(Option::class)->orderBy('order');
    }

    public function correctOption()
    {
        return $this->hasOne(Option::class)->where('is_correct', true);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class);
    }

    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        if (str_starts_with($this->image_path, 'storage/')) {
            return '/' . $this->image_path;
        }

        if (str_starts_with($this->image_path, '/')) {
            return $this->image_path;
        }

        return '/storage/' . $this->image_path;
    }

    public function failRate(): float
    {
        $total = $this->answers()->count();
        if ($total === 0) {
            return 0.0;
        }
        $wrong = $this->answers()->where('is_correct', false)->count();

        return round(($wrong / $total) * 100, 1);
    }
}