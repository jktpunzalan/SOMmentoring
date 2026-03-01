<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, HasApiTokens, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'student_id',
        'year_level',
        'phone',
        'avatar',
        'profile_complete',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'profile_complete' => 'boolean',
        ];
    }

    // Role helpers
    public function isSuperAdmin(): bool
    {
        return $this->role === 'super_admin';
    }

    public function isMentor(): bool
    {
        return $this->role === 'mentor';
    }

    public function isMentee(): bool
    {
        return $this->role === 'mentee';
    }

    // Relationships
    public function mentees(): HasMany
    {
        return $this->hasMany(MentorMentee::class, 'mentor_id');
    }

    public function mentor(): HasOne
    {
        return $this->hasOne(MentorMentee::class, 'mentee_id');
    }

    public function approvedMentees(): HasMany
    {
        return $this->hasMany(MentorMentee::class, 'mentor_id')->where('status', 'approved');
    }

    public function mentoringSessionsAsMentor(): HasMany
    {
        return $this->hasMany(MentoringSession::class, 'mentor_id');
    }

    public function appointmentsAsMentor(): HasMany
    {
        return $this->hasMany(Appointment::class, 'mentor_id');
    }

    public function proposedAppointments(): HasMany
    {
        return $this->hasMany(Appointment::class, 'proposed_by_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications(): HasMany
    {
        return $this->notifications()->whereNull('read_at');
    }

    public function sessionParticipations(): HasMany
    {
        return $this->hasMany(SessionParticipant::class, 'mentee_id');
    }

    public function appointmentInvitations(): HasMany
    {
        return $this->hasMany(AppointmentMentee::class, 'mentee_id');
    }
}
