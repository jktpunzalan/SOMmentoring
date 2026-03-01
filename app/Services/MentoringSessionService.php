<?php

namespace App\Services;

use App\Models\MentoringSession;
use App\Models\User;
use App\Repositories\AppointmentRepository;
use App\Repositories\MentoringSessionRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class MentoringSessionService
{
    public function __construct(
        private MentoringSessionRepository $sessionRepository,
        private AppointmentRepository $appointmentRepository,
        private NotificationService $notificationService,
    ) {}

    public function list(User $user, array $filters = []): LengthAwarePaginator
    {
        if ($user->isSuperAdmin()) {
            return MentoringSession::with(['mentor', 'participants.mentee', 'photos'])
                ->orderBy('started_at', 'desc')
                ->paginate($filters['per_page'] ?? 15);
        }

        if ($user->isMentor()) {
            return $this->sessionRepository->getByMentor($user->id, $filters);
        }

        return $this->sessionRepository->getByMentee($user->id, $filters);
    }

    public function show(string $ulid): MentoringSession
    {
        $session = $this->sessionRepository->findByUlid($ulid);
        abort_if(!$session, 404, 'Session not found.');
        return $session;
    }

    public function create(array $data, User $mentor): MentoringSession
    {
        abort_if(!$mentor->isMentor(), 403, 'Only mentors can create sessions.');
        abort_if(
            $this->sessionRepository->hasOngoingSession($mentor->id),
            422,
            'You already have an ongoing session. Please end it first.'
        );

        if (!empty($data['appointment_id'])) {
            $appointment = $this->appointmentRepository->findById($data['appointment_id']);
            abort_if(!$appointment, 404, 'Appointment not found.');
            abort_if($appointment->status !== 'approved', 422, 'Appointment must be approved to start a session.');
            abort_if($appointment->mentor_id !== $mentor->id, 403, 'This appointment belongs to another mentor.');
        }

        return DB::transaction(function () use ($data, $mentor) {
            $session = $this->sessionRepository->create([
                'appointment_id' => $data['appointment_id'] ?? null,
                'mentor_id' => $mentor->id,
                'title' => $data['title'],
                'started_at' => now(),
                'status' => 'ongoing',
            ]);

            $menteeIds = $data['mentee_ids'] ?? [];

            if (!empty($data['appointment_id']) && empty($menteeIds)) {
                $appointment = $this->appointmentRepository->findById($data['appointment_id']);
                $menteeIds = $appointment->mentees->pluck('mentee_id')->toArray();
            }

            foreach ($menteeIds as $menteeId) {
                $session->participants()->create([
                    'mentee_id' => $menteeId,
                    'attended' => true,
                    'joined_at' => now(),
                ]);
            }

            if (!empty($data['appointment_id'])) {
                $this->appointmentRepository->update(
                    $this->appointmentRepository->findById($data['appointment_id']),
                    ['status' => 'completed']
                );
            }

            return $session->load(['mentor', 'notes', 'participants.mentee', 'photos']);
        });
    }

    public function endSession(string $ulid, User $mentor): MentoringSession
    {
        $session = $this->show($ulid);

        abort_if($session->mentor_id !== $mentor->id, 403, 'Unauthorized.');
        abort_if($session->status !== 'ongoing', 422, 'Session is not ongoing.');

        return DB::transaction(function () use ($session) {
            $updated = $this->sessionRepository->update($session, [
                'ended_at' => now(),
                'status' => 'completed',
            ]);

            $participantIds = $session->participants->pluck('mentee_id')->toArray();
            $this->notificationService->notifySessionCompleted($session, $participantIds);

            return $updated;
        });
    }

    public function getOngoing(User $mentor): ?MentoringSession
    {
        return $this->sessionRepository->getOngoingSession($mentor->id);
    }
}
