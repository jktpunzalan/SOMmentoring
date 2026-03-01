<?php

namespace App\Repositories;

use App\Models\MentoringSession;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class MentoringSessionRepository
{
    public function findById(int $id): ?MentoringSession
    {
        return MentoringSession::with(['mentor', 'notes', 'participants.mentee', 'photos'])->find($id);
    }

    public function findByUlid(string $ulid): ?MentoringSession
    {
        return MentoringSession::with(['mentor', 'notes', 'participants.mentee', 'photos', 'appointment'])
            ->where('ulid', $ulid)->first();
    }

    public function getByMentor(int $mentorId, array $filters = []): LengthAwarePaginator
    {
        $query = MentoringSession::with(['participants.mentee', 'photos'])
            ->where('mentor_id', $mentorId);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('started_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function getByMentee(int $menteeId, array $filters = []): LengthAwarePaginator
    {
        $query = MentoringSession::with(['mentor', 'photos'])
            ->whereHas('participants', fn ($q) => $q->where('mentee_id', $menteeId));

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('started_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function hasOngoingSession(int $mentorId): bool
    {
        return MentoringSession::where('mentor_id', $mentorId)
            ->where('status', 'ongoing')
            ->exists();
    }

    public function getOngoingSession(int $mentorId): ?MentoringSession
    {
        return MentoringSession::with(['notes', 'participants.mentee', 'photos'])
            ->where('mentor_id', $mentorId)
            ->where('status', 'ongoing')
            ->first();
    }

    public function create(array $data): MentoringSession
    {
        return MentoringSession::create($data);
    }

    public function update(MentoringSession $session, array $data): MentoringSession
    {
        $session->update($data);
        return $session->fresh();
    }
}
