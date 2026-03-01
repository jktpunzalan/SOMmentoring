<?php

namespace App\Repositories;

use App\Models\SessionNote;

class SessionNoteRepository
{
    public function findBySessionId(int $sessionId): ?SessionNote
    {
        return SessionNote::where('session_id', $sessionId)->first();
    }

    public function create(array $data): SessionNote
    {
        return SessionNote::create($data);
    }

    public function update(SessionNote $note, array $data): SessionNote
    {
        $note->update($data);
        return $note->fresh();
    }

    public function createOrUpdate(int $sessionId, array $data): SessionNote
    {
        $note = $this->findBySessionId($sessionId);

        if ($note) {
            return $this->update($note, $data);
        }

        return $this->create(array_merge($data, ['session_id' => $sessionId]));
    }
}
