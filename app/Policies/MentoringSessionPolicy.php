<?php

namespace App\Policies;

use App\Models\MentoringSession;
use App\Models\User;

class MentoringSessionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, MentoringSession $session): bool
    {
        if ($user->isSuperAdmin()) return true;
        if ($user->id === $session->mentor_id) return true;
        if ($session->participants()->where('mentee_id', $user->id)->exists()) return true;
        return false;
    }

    public function create(User $user): bool
    {
        return $user->isMentor();
    }

    public function end(User $user, MentoringSession $session): bool
    {
        return $user->id === $session->mentor_id;
    }
}
