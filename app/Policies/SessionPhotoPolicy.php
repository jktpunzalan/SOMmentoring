<?php

namespace App\Policies;

use App\Models\MentoringSession;
use App\Models\SessionPhoto;
use App\Models\User;

class SessionPhotoPolicy
{
    public function view(User $user, SessionPhoto $photo): bool
    {
        $session = $photo->session;
        if ($user->isSuperAdmin()) return true;
        if ($user->id === $session->mentor_id) return true;
        if ($session->participants()->where('mentee_id', $user->id)->exists()) return true;
        return false;
    }

    public function create(User $user, MentoringSession $session): bool
    {
        return $user->id === $session->mentor_id;
    }

    public function download(User $user, SessionPhoto $photo): bool
    {
        return $this->view($user, $photo);
    }
}
