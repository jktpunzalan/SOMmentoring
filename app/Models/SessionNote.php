<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SessionNote extends Model
{
    protected $fillable = [
        'session_id',
        'agenda',
        'key_discussion_points',
        'action_items',
        'next_session_date',
        'free_text_notes',
    ];

    protected function casts(): array
    {
        return [
            'next_session_date' => 'date',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(MentoringSession::class, 'session_id');
    }
}
