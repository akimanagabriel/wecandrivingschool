<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SharedAccessSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'shared_access_link_id',
        'session_id',
        'ip_address',
        'user_agent',
        'quiz_attempt_id',
        'accessed_at',
    ];

    protected $casts = [
        'accessed_at' => 'datetime',
    ];

    public function link()
    {
        return $this->belongsTo(SharedAccessLink::class, 'shared_access_link_id');
    }

    public function quizAttempt()
    {
        return $this->belongsTo(QuizAttempt::class);
    }
}
