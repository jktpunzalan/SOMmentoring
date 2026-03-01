<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionParticipant extends Model
{
    protected $fillable = [
        'session_id',
        'mentee_id',
        'attended',
        'joined_at',
    ];

    protected function casts(): array
    {
        return [
            'attended' => 'boolean',
            'joined_at' => 'datetime',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(MentoringSession::class, 'session_id');
    }

    public function mentee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentee_id');
    }
}
