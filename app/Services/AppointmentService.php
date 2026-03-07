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
        abort_if(!$proposer->isMentor() && !$proposer->isSuperAdmin(), 403, 'Only mentors can create appointment slots.');

        return DB::transaction(function () use ($data, $proposer) {
            $appointment = $this->appointmentRepository->create([
                'mentor_id' => $proposer->id,
                'proposed_by_id' => $proposer->id,
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'venue' => $data['venue'] ?? null,
                'scheduled_at' => $data['scheduled_at'],
                'duration_minutes' => $data['duration_minutes'] ?? 60,
                'is_group' => $data['is_group'] ?? true,
                'max_participants' => $data['max_participants'] ?? 10,
                'status' => 'open',
            ]);

            $menteeIds = $data['mentee_ids'] ?? [];
            if (!empty($menteeIds)) {
                foreach ($menteeIds as $menteeId) {
                    $appointment->mentees()->create([
                        'mentee_id' => $menteeId,
                        'status' => 'approved',
                    ]);
                }
            }

            return $appointment->load(['mentor', 'proposedBy', 'mentees.mentee']);
        });
    }

    public function update(string $ulid, array $data, User $user): Appointment
    {
        $appointment = $this->show($ulid);

        abort_if(!in_array($appointment->status, ['open', 'pending']), 422, 'Only open slots can be edited.');

        return DB::transaction(function () use ($appointment, $data) {
            $this->appointmentRepository->update($appointment, $data);
            return $appointment->fresh(['mentor', 'proposedBy', 'mentees.mentee']);
        });
    }

    public function getAvailableSlots(User $user): Collection
    {
        abort_if(!$user->isMentee(), 403, 'Only mentees can browse available slots.');

        $record = $this->mentorMenteeRepository->findByMenteeId($user->id);
        abort_if(!$record || !$record->isApproved(), 403, 'You must be an approved mentee.');

        return $this->appointmentRepository->getAvailableSlots($record->mentor_id, $user->id);
    }

    public function enroll(string $ulid, User $user): Appointment
    {
        abort_if(!$user->isMentee(), 403, 'Only mentees can enroll.');

        $appointment = $this->show($ulid);
        abort_if($appointment->status !== 'open', 422, 'This slot is not open for enrollment.');

        $alreadyEnrolled = $appointment->mentees()->where('mentee_id', $user->id)->exists();
        abort_if($alreadyEnrolled, 422, 'You are already enrolled in this slot.');

        $currentCount = $appointment->mentees()->count();
        abort_if($currentCount >= $appointment->max_participants, 422, 'This slot is full.');

        $appointment->mentees()->create([
            'mentee_id' => $user->id,
            'status' => 'pending',
        ]);

        $this->notificationService->notifyAppointmentProposed($appointment);

        return $appointment->fresh(['mentor', 'proposedBy', 'mentees.mentee']);
    }

    public function unenroll(string $ulid, User $user): Appointment
    {
        $appointment = $this->show($ulid);

        $pivot = $appointment->mentees()->where('mentee_id', $user->id)->first();
        abort_if(!$pivot, 404, 'You are not enrolled in this slot.');
        abort_if($pivot->status === 'approved', 422, 'Cannot withdraw after being approved. Contact your mentor.');

        $pivot->delete();

        return $appointment->fresh(['mentor', 'proposedBy', 'mentees.mentee']);
    }

    public function approveMentee(string $ulid, int $menteeId): Appointment
    {
        $appointment = $this->show($ulid);

        $pivot = $appointment->mentees()->where('mentee_id', $menteeId)->first();
        abort_if(!$pivot, 404, 'Mentee not found in this appointment.');
        abort_if($pivot->status !== 'pending', 422, 'Only pending enrollments can be approved.');

        $pivot->update(['status' => 'approved']);

        return $appointment->fresh(['mentor', 'proposedBy', 'mentees.mentee']);
    }

    public function rejectMentee(string $ulid, int $menteeId): Appointment
    {
        $appointment = $this->show($ulid);

        $pivot = $appointment->mentees()->where('mentee_id', $menteeId)->first();
        abort_if(!$pivot, 404, 'Mentee not found in this appointment.');
        abort_if($pivot->status !== 'pending', 422, 'Only pending enrollments can be rejected.');

        $pivot->update(['status' => 'rejected']);

        return $appointment->fresh(['mentor', 'proposedBy', 'mentees.mentee']);
    }

    public function approve(string $ulid, User $approver): Appointment
    {
        $appointment = $this->show($ulid);

        abort_if($appointment->status !== 'pending', 422, 'Only pending appointments can be approved.');

        if ($this->appointmentRepository->hasOverlap(
            $appointment->mentor_id,
            $appointment->scheduled_at->toDateTimeString(),
            $appointment->duration_minutes ?? 60,
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
            !in_array($appointment->status, ['pending', 'approved', 'open']),
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

    public function removeConfirmedAppointment(string $ulid, User $user): void
    {
        abort_if(!$user->isMentor(), 403, 'Only mentors can remove appointments.');

        $appointment = $this->show($ulid);

        abort_if($appointment->mentor_id !== $user->id, 403, 'You are not authorized to remove this appointment.');

        abort_if(
            !in_array($appointment->status, ['open', 'approved']),
            422,
            'Only open or approved appointments can be removed.'
        );

        abort_if($appointment->session && $appointment->session->isOngoing(), 422, 'Cannot remove an appointment with an active session.');

        DB::transaction(function () use ($appointment, $user) {
            $appointment->delete();

            $this->notificationService->createInternalNotification($user->id, 'appointment.removed', 'Appointment Removed', "You removed the appointment: {$appointment->title}.", [
                'appointment_ulid' => $appointment->ulid,
            ]);
        });
    }

    public function removeMenteeFromSlot(string $ulid, int $menteeId, User $user): Appointment
    {
        abort_if(!$user->isMentor(), 403, 'Only mentors can remove mentees.');

        $appointment = $this->show($ulid);

        abort_if($appointment->mentor_id !== $user->id, 403, 'You are not authorized to modify this appointment.');
        abort_if($appointment->session && $appointment->session->isOngoing(), 422, 'Cannot remove a mentee while a session is active.');

        $pivot = $appointment->mentees()->where('mentee_id', $menteeId)->first();
        abort_if(!$pivot, 404, 'Mentee not found in this appointment.');

        DB::transaction(function () use ($appointment, $menteeId, $user) {
            $this->appointmentRepository->removeMenteeFromAppointment($appointment->id, $menteeId);

            $this->notificationService->createInternalNotification($user->id, 'appointment.mentee_removed', 'Mentee Removed', "You removed a mentee from the appointment: {$appointment->title}.", [
                'appointment_ulid' => $appointment->ulid,
                'mentee_id' => $menteeId,
            ]);
        });

        return $appointment->fresh(['mentor', 'proposedBy', 'mentees.mentee', 'session']);
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
