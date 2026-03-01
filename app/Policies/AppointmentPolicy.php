<?php

namespace App\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Appointment $appointment): bool
    {
        if ($user->isSuperAdmin()) return true;
        if ($user->id === $appointment->mentor_id) return true;
        if ($appointment->status === 'open') return true;
        if ($appointment->mentees()->where('mentee_id', $user->id)->exists()) return true;
        return false;
    }

    public function create(User $user): bool
    {
        return $user->isMentor() || $user->isMentee();
    }

    public function update(User $user, Appointment $appointment): bool
    {
        if ($user->isSuperAdmin()) return true;
        if (!in_array($appointment->status, ['pending', 'open'])) return false;
        return $user->id === $appointment->mentor_id || $user->id === $appointment->proposed_by_id;
    }

    public function approve(User $user, Appointment $appointment): bool
    {
        if ($user->isSuperAdmin()) return true;
        if ($user->id === $appointment->proposed_by_id) return false;

        if ($user->isMentor() && $user->id === $appointment->mentor_id) return true;
        if ($user->isMentee() && $appointment->mentees()->where('mentee_id', $user->id)->exists()) return true;

        return false;
    }

    public function reject(User $user, Appointment $appointment): bool
    {
        return $this->approve($user, $appointment);
    }

    public function cancel(User $user, Appointment $appointment): bool
    {
        if ($user->isSuperAdmin()) return true;
        return $user->id === $appointment->proposed_by_id || $user->id === $appointment->mentor_id;
    }
}
