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

    // How many times this question was answered incorrectly (for analytics)
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
