<?php

namespace App\Services;

use App\Models\SessionPhoto;
use App\Models\User;
use App\Repositories\MentoringSessionRepository;
use App\Repositories\SessionPhotoRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class SessionPhotoService
{
    public function __construct(
        private SessionPhotoRepository $photoRepository,
        private MentoringSessionRepository $sessionRepository,
    ) {}

    public function getBySession(string $sessionUlid): Collection
    {
        $session = $this->sessionRepository->findByUlid($sessionUlid);
        abort_if(!$session, 404, 'Session not found.');

        return $this->photoRepository->getBySessionId($session->id);
    }

    public function upload(string $sessionUlid, UploadedFile $file, User $uploader): SessionPhoto
    {
        $session = $this->sessionRepository->findByUlid($sessionUlid);

        abort_if(!$session, 404, 'Session not found.');
        abort_if($session->mentor_id !== $uploader->id, 403, 'Unauthorized.');

        if ($this->photoRepository->existsForSession($session->id)) {
            $existing = $this->photoRepository->getBySessionId($session->id)->first();
            if ($existing) {
                Storage::disk('local')->delete($existing->file_path);
                $this->photoRepository->delete($existing);
            }
        }

        $timestamp = now()->format('YmdHis');
        $fileName = "session_{$session->id}_{$timestamp}.jpg";
        $filePath = $file->storeAs('private/session-photos', $fileName, 'local');

        return $this->photoRepository->create([
            'session_id' => $session->id,
            'file_path' => $filePath,
            'file_name' => $fileName,
            'captured_at' => now(),
            'uploaded_by_id' => $uploader->id,
        ]);
    }

    public function download(string $sessionUlid, int $photoId): array
    {
        $session = $this->sessionRepository->findByUlid($sessionUlid);
        abort_if(!$session, 404, 'Session not found.');

        $photo = $this->photoRepository->findById($photoId);
        abort_if(!$photo || $photo->session_id !== $session->id, 404, 'Photo not found.');

        $fullPath = Storage::disk('local')->path($photo->file_path);
        abort_if(!file_exists($fullPath), 404, 'Photo file not found on disk.');

        return [
            'path' => $fullPath,
            'name' => $photo->file_name,
            'mime' => mime_content_type($fullPath),
        ];
    }
}
