<?php

namespace App\Repositories;

use App\Models\SessionPhoto;
use Illuminate\Database\Eloquent\Collection;

class SessionPhotoRepository
{
    public function findById(int $id): ?SessionPhoto
    {
        return SessionPhoto::find($id);
    }

    public function getBySessionId(int $sessionId): Collection
    {
        return SessionPhoto::where('session_id', $sessionId)->orderBy('captured_at', 'desc')->get();
    }

    public function create(array $data): SessionPhoto
    {
        return SessionPhoto::create($data);
    }

    public function delete(SessionPhoto $photo): bool
    {
        return $photo->delete();
    }

    public function existsForSession(int $sessionId): bool
    {
        return SessionPhoto::where('session_id', $sessionId)->exists();
    }
}
