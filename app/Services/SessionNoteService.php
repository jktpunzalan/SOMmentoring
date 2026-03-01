<?php

namespace App\Services;

use App\Models\MentoringSession;
use App\Models\SessionNote;
use App\Models\User;
use App\Repositories\MentoringSessionRepository;
use App\Repositories\SessionNoteRepository;

class SessionNoteService
{
    public function __construct(
        private SessionNoteRepository $noteRepository,
        private MentoringSessionRepository $sessionRepository,
    ) {}

    public function getBySession(string $sessionUlid): ?SessionNote
    {
        $session = $this->sessionRepository->findByUlid($sessionUlid);
        abort_if(!$session, 404, 'Session not found.');

        return $this->noteRepository->findBySessionId($session->id);
    }

    public function createOrUpdate(string $sessionUlid, array $data, User $mentor): SessionNote
    {
        $session = $this->sessionRepository->findByUlid($sessionUlid);

        abort_if(!$session, 404, 'Session not found.');
        abort_if($session->mentor_id !== $mentor->id, 403, 'Unauthorized.');
        abort_if($session->isCompleted(), 422, 'Cannot edit notes for a completed session.');

        return $this->noteRepository->createOrUpdate($session->id, [
            'agenda' => $data['agenda'] ?? null,
            'key_discussion_points' => $data['key_discussion_points'] ?? null,
            'action_items' => $data['action_items'] ?? null,
            'next_session_date' => $data['next_session_date'] ?? null,
            'free_text_notes' => $data['free_text_notes'] ?? null,
        ]);
    }
}
