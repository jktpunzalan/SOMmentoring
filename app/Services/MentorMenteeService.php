<?php

namespace App\Services;

use App\Models\MentorMentee;
use App\Models\MentoringSession;
use App\Models\User;
use App\Repositories\AppointmentRepository;
use App\Repositories\MentorMenteeRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class MentorMenteeService
{
    public function __construct(
        private AppointmentRepository $appointmentRepository,
        private MentorMenteeRepository $mentorMenteeRepository,
        private NotificationService $notificationService,
    ) {}

    public function getMenteesByMentor(int $mentorId, ?string $status = null): Collection
    {
        return $this->mentorMenteeRepository->getMenteesByMentor($mentorId, $status);
    }

    public function getPendingByMentor(int $mentorId): Collection
    {
        return $this->mentorMenteeRepository->getPendingByMentor($mentorId);
    }

    public function getMenteeDetail(int $menteeId, User $viewer): array
    {
        $record = $this->mentorMenteeRepository->findByMenteeId($menteeId);
        abort_if(!$record, 404, 'Mentor-mentee record not found.');

        abort_if($record->mentor_id !== $viewer->id && !$viewer->isSuperAdmin(), 403, 'Unauthorized.');

        $mentorId = $viewer->isSuperAdmin() ? $record->mentor_id : $viewer->id;
        $appointments = $this->appointmentRepository->getByMentorAndMentee($mentorId, $menteeId);

        $sessions = MentoringSession::with(['mentor', 'participants.mentee', 'photos'])
            ->where('mentor_id', $mentorId)
            ->where('status', 'completed')
            ->whereHas('participants', fn ($q) => $q->where('mentee_id', $menteeId))
            ->orderBy('started_at', 'desc')
            ->get();

        return [
            'record' => $record->load(['mentor', 'mentee']),
            'appointments' => $appointments,
            'sessions' => $sessions,
        ];
    }

    public function approve(int $menteeId, User $mentor): MentorMentee
    {
        $record = $this->mentorMenteeRepository->findByMenteeId($menteeId);

        abort_if(!$record, 404, 'Mentor-mentee record not found.');
        abort_if($record->mentor_id !== $mentor->id && !$mentor->isSuperAdmin(), 403, 'Unauthorized.');
        abort_if($record->status !== 'pending', 422, 'Only pending registrations can be approved.');

        return DB::transaction(function () use ($record) {
            $updated = $this->mentorMenteeRepository->update($record, [
                'status' => 'approved',
                'approved_at' => now(),
            ]);

            $this->notificationService->notifyMenteeApproved($record->mentee_id, $record->mentor_id);

            return $updated;
        });
    }

    public function reject(int $menteeId, User $mentor, ?string $reason = null): MentorMentee
    {
        $record = $this->mentorMenteeRepository->findByMenteeId($menteeId);

        abort_if(!$record, 404, 'Mentor-mentee record not found.');
        abort_if($record->mentor_id !== $mentor->id && !$mentor->isSuperAdmin(), 403, 'Unauthorized.');
        abort_if($record->status !== 'pending', 422, 'Only pending registrations can be rejected.');

        return DB::transaction(function () use ($record, $reason) {
            $updated = $this->mentorMenteeRepository->update($record, [
                'status' => 'rejected',
                'rejection_reason' => $reason,
            ]);

            $this->notificationService->notifyMenteeRejected($record->mentee_id, $record->mentor_id, $reason);

            return $updated;
        });
    }
}
