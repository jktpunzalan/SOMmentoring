<?php

namespace App\Repositories;

use App\Models\MentorMentee;
use Illuminate\Database\Eloquent\Collection;

class MentorMenteeRepository
{
    public function findById(int $id): ?MentorMentee
    {
        return MentorMentee::with(['mentor', 'mentee'])->find($id);
    }

    public function findByMenteeId(int $menteeId): ?MentorMentee
    {
        return MentorMentee::with(['mentor', 'mentee'])->where('mentee_id', $menteeId)->first();
    }

    public function getMenteesByMentor(int $mentorId, ?string $status = null): Collection
    {
        $query = MentorMentee::with('mentee')->where('mentor_id', $mentorId);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    public function getPendingByMentor(int $mentorId): Collection
    {
        return $this->getMenteesByMentor($mentorId, 'pending');
    }

    public function getApprovedByMentor(int $mentorId): Collection
    {
        return $this->getMenteesByMentor($mentorId, 'approved');
    }

    public function create(array $data): MentorMentee
    {
        return MentorMentee::create($data);
    }

    public function update(MentorMentee $record, array $data): MentorMentee
    {
        $record->update($data);
        return $record->fresh();
    }
}
