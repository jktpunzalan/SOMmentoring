<?php

namespace App\Policies;

use App\Models\MentoringSession;
use App\Models\SessionNote;
use App\Models\User;

class SessionNotePolicy
{
    public function view(User $user, SessionNote $note): bool
    {
        $session = $note->session;
        if ($user->isSuperAdmin()) return true;
        if ($user->id === $session->mentor_id) return true;
        if ($session->participants()->where('mentee_id', $user->id)->exists()) return true;
        return false;
    }

    public function create(User $user, MentoringSession $session): bool
    {
        return $user->id === $session->mentor_id;
    }

    public function update(User $user, SessionNote $note): bool
    {
        $session = $note->session;
        if ($session->isCompleted()) return false;
        return $user->id === $session->mentor_id;
    }
}
