<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Option extends Model
{
    use HasFactory;

    protected $fillable = [
        'question_id',
        'option_text',
        'image_path',
        'is_correct',
        'order',
    ];

    protected $casts = ['is_correct' => 'boolean'];

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function answers()
    {
        return $this->hasMany(Answer::class, 'selected_option_id');
    }

    // Helper to get the full image URL
    public function getImageUrlAttribute(): ?string
    {
        if (!$this->image_path) {
            return null;
        }

        // If it's already a full URL
        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        // If it starts with 'storage/', add leading slash
        if (str_starts_with($this->image_path, 'storage/')) {
            return '/' . $this->image_path;
        }

        // If it starts with '/', return as is
        if (str_starts_with($this->image_path, '/')) {
            return $this->image_path;
        }

        // Otherwise, prepend /storage/
        return '/storage/' . $this->image_path;
    }
}