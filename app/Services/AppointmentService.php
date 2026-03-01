<?php

namespace App\Services;

use App\Models\Appointment;
use App\Models\User;
use App\Repositories\AppointmentRepository;
use App\Repositories\MentorMenteeRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AppointmentService
{
    public function __construct(
        private AppointmentRepository $appointmentRepository,
        private MentorMenteeRepository $mentorMenteeRepository,
        private NotificationService $notificationService,
    ) {}

    public function list(User $user, array $filters = []): LengthAwarePaginator
    {
        if ($user->isSuperAdmin()) {
            return Appointment::with(['mentor', 'proposedBy', 'mentees.mentee'])
                ->orderBy('scheduled_at', 'desc')
                ->paginate($filters['per_page'] ?? 15);
        }

        if ($user->isMentor()) {
            return $this->appointmentRepository->getByMentor($user->id, $filters);
        }

        return $this->appointmentRepository->getByMentee($user->id, $filters);
    }

    public function show(string $ulid): Appointment
    {
        $appointment = $this->appointmentRepository->findByUlid($ulid);
        abort_if(!$appointment, 404, 'Appointment not found.');
        return $appointment;
    }

    public function create(array $data, User $proposer): Appointment
    {
        $mentorId = $proposer->isMentor() ? $proposer->id : $data['mentor_id'];

        if ($proposer->isMentee()) {
            $record = $this->mentorMenteeRepository->findByMenteeId($proposer->id);
            abort_if(!$record || !$record->isApproved(), 403, 'You must be an approved mentee.');
            $mentorId = $record->mentor_id;
        }

        return DB::transaction(function () use ($data, $proposer, $mentorId) {
            $appointment = $this->appointmentRepository->create([
                'mentor_id' => $mentorId,
                'proposed_by_id' => $proposer->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'venue' => $data['venue'] ?? null,
                'scheduled_at' => $data['scheduled_at'],
                'duration_minutes' => $data['duration_minutes'] ?? 60,
                'is_group' => $data['is_group'] ?? false,
                'max_participants' => $data['max_participants'] ?? 15,
                'status' => 'pending',
            ]);

            $menteeIds = $data['mentee_ids'] ?? [];

            if ($proposer->isMentee() && empty($menteeIds)) {
                $menteeIds = [$proposer->id];
            }

            foreach ($menteeIds as $menteeId) {
                $appointment->mentees()->create([
                    'mentee_id' => $menteeId,
                    'status' => 'invited',
                ]);
            }

            $this->notificationService->notifyAppointmentProposed($appointment);

            return $appointment->load(['mentor', 'proposedBy', 'mentees.mentee']);
        });
    }

    public function update(string $ulid, array $data, User $user): Appointment
    {
        $appointment = $this->show($ulid);

        abort_if($appointment->status !== 'pending', 422, 'Only pending appointments can be edited.');

        return DB::transaction(function () use ($appointment, $data) {
            $this->appointmentRepository->update($appointment, $data);

            if (isset($data['mentee_ids'])) {
                $appointment->mentees()->delete();
                foreach ($data['mentee_ids'] as $menteeId) {
                    $appointment->mentees()->create([
                        'mentee_id' => $menteeId,
                        'status' => 'invited',
                    ]);
                }
            }

            return $appointment->fresh(['mentor', 'proposedBy', 'mentees.mentee']);
        });
    }

    public function approve(string $ulid, User $approver): Appointment
    {
        $appointment = $this->show($ulid);

        abort_if($appointment->status !== 'pending', 422, 'Only pending appointments can be approved.');

        if ($this->appointmentRepository->hasOverlap(
            $appointment->mentor_id,
            $appointment->scheduled_at->toDateTimeString(),
            $appointment->duration_minutes,
            $appointment->id
        )) {
            throw ValidationException::withMessages([
                'scheduled_at' => ['This time slot conflicts with another approved appointment.'],
            ]);
        }

        return DB::transaction(function () use ($appointment, $approver) {
            $updated = $this->appointmentRepository->update($appointment, [
                'status' => 'approved',
                'approved_at' => now(),
                'approved_by_id' => $approver->id,
            ]);

            $this->notificationService->notifyAppointmentApproved($appointment);

            return $updated;
        });
    }

    public function reject(string $ulid, User $rejecter, ?string $reason = null): Appointment
    {
        $appointment = $this->show($ulid);

        abort_if($appointment->status !== 'pending', 422, 'Only pending appointments can be rejected.');

        return DB::transaction(function () use ($appointment, $reason) {
            $updated = $this->appointmentRepository->update($appointment, [
                'status' => 'rejected',
                'rejection_reason' => $reason,
            ]);

            $this->notificationService->notifyAppointmentRejected($appointment, $reason);

            return $updated;
        });
    }

    public function cancel(string $ulid, User $user): Appointment
    {
        $appointment = $this->show($ulid);

        abort_if(
            !in_array($appointment->status, ['pending', 'approved']),
            422,
            'This appointment cannot be cancelled.'
        );

        abort_if(
            $appointment->proposed_by_id !== $user->id
            && $appointment->mentor_id !== $user->id
            && !$user->isSuperAdmin(),
            403,
            'You are not authorized to cancel this appointment.'
        );

        return $this->appointmentRepository->update($appointment, ['status' => 'cancelled']);
    }

    public function getCalendarData(User $user, string $startDate, string $endDate): Collection
    {
        return $this->appointmentRepository->getCalendarData(
            $user->id,
            $user->role,
            $startDate,
            $endDate
        );
    }
}
