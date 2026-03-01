<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Appointment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'ulid',
        'mentor_id',
        'proposed_by_id',
        'title',
        'description',
        'venue',
        'scheduled_at',
        'duration_minutes',
        'is_group',
        'max_participants',
        'status',
        'rejection_reason',
        'approved_at',
        'approved_by_id',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'approved_at' => 'datetime',
            'is_group' => 'boolean',
            'duration_minutes' => 'integer',
            'max_participants' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Appointment $appointment) {
            if (empty($appointment->ulid)) {
                $appointment->ulid = strtolower((string) Str::ulid());
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'ulid';
    }

    public function mentor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'mentor_id');
    }

    public function proposedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proposed_by_id');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by_id');
    }

    public function mentees(): HasMany
    {
        return $this->hasMany(AppointmentMentee::class);
    }

    public function session(): HasOne
    {
        return $this->hasOne(MentoringSession::class);
    }

    public function getEndTimeAttribute(): \Carbon\Carbon
    {
        return $this->scheduled_at->copy()->addMinutes($this->duration_minutes);
    }
}
