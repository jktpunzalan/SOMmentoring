<?php

namespace App\Services;

use App\Models\User;
use App\Models\Appointment;
use App\Models\MentoringSession;
use App\Repositories\NotificationRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class NotificationService
{
    public function __construct(
        private NotificationRepository $notificationRepository,
    ) {}

    public function createInternalNotification(int $userId, string $type, string $title, string $message, array $data = []): void
    {
        $this->notificationRepository->create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public function list(User $user, array $filters = []): LengthAwarePaginator
    {
        return $this->notificationRepository->getByUser($user->id, $filters);
    }

    public function getUnreadCount(User $user): int
    {
        return $this->notificationRepository->getUnreadCount($user->id);
    }

    public function markAsRead(int $notificationId, User $user): void
    {
        $notification = $this->notificationRepository->findById($notificationId);
        abort_if(!$notification || $notification->user_id !== $user->id, 404);
        $this->notificationRepository->markAsRead($notification);
    }

    public function markAllAsRead(User $user): int
    {
        return $this->notificationRepository->markAllAsRead($user->id);
    }

    public function notifyMenteeRegistration(User $mentee, int $mentorId): void
    {
        $this->notificationRepository->create([
            'user_id' => $mentorId,
            'type' => 'registration.pending',
            'title' => 'New Mentee Registration',
            'message' => "{$mentee->name} has registered and is awaiting your approval.",
            'data' => ['mentee_id' => $mentee->id, 'mentee_name' => $mentee->name],
        ]);
    }

    public function notifyMenteeApproved(int $menteeId, int $mentorId): void
    {
        $mentor = User::find($mentorId);
        $this->notificationRepository->create([
            'user_id' => $menteeId,
            'type' => 'registration.approved',
            'title' => 'Registration Approved',
            'message' => "Your registration has been approved by {$mentor->name}. You can now use the system.",
            'data' => ['mentor_id' => $mentorId],
        ]);
    }

    public function notifyMenteeRejected(int $menteeId, int $mentorId, ?string $reason = null): void
    {
        $mentor = User::find($mentorId);
        $message = "Your registration has been rejected by {$mentor->name}.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }

        $this->notificationRepository->create([
            'user_id' => $menteeId,
            'type' => 'registration.rejected',
            'title' => 'Registration Rejected',
            'message' => $message,
            'data' => ['mentor_id' => $mentorId, 'reason' => $reason],
        ]);
    }

    public function notifyAppointmentProposed(Appointment $appointment): void
    {
        $proposer = $appointment->proposedBy;

        if ($proposer->isMentee()) {
            $this->notificationRepository->create([
                'user_id' => $appointment->mentor_id,
                'type' => 'appointment.proposed',
                'title' => 'New Appointment Request',
                'message' => "{$proposer->name} has proposed an appointment: {$appointment->title}",
                'data' => ['appointment_ulid' => $appointment->ulid],
            ]);
        } else {
            foreach ($appointment->mentees as $am) {
                $this->notificationRepository->create([
                    'user_id' => $am->mentee_id,
                    'type' => 'appointment.proposed',
                    'title' => 'New Appointment Invitation',
                    'message' => "{$proposer->name} has proposed an appointment: {$appointment->title}",
                    'data' => ['appointment_ulid' => $appointment->ulid],
                ]);
            }
        }
    }

    public function notifyAppointmentApproved(Appointment $appointment): void
    {
        $this->notificationRepository->create([
            'user_id' => $appointment->proposed_by_id,
            'type' => 'appointment.approved',
            'title' => 'Appointment Approved',
            'message' => "Your appointment \"{$appointment->title}\" has been approved.",
            'data' => ['appointment_ulid' => $appointment->ulid],
        ]);
    }

    public function notifyAppointmentRejected(Appointment $appointment, ?string $reason = null): void
    {
        $message = "Your appointment \"{$appointment->title}\" has been rejected.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }

        $this->notificationRepository->create([
            'user_id' => $appointment->proposed_by_id,
            'type' => 'appointment.rejected',
            'title' => 'Appointment Rejected',
            'message' => $message,
            'data' => ['appointment_ulid' => $appointment->ulid, 'reason' => $reason],
        ]);
    }

    public function notifySessionCompleted(MentoringSession $session, array $participantMenteeIds): void
    {
        foreach ($participantMenteeIds as $menteeId) {
            $this->notificationRepository->create([
                'user_id' => $menteeId,
                'type' => 'session.completed',
                'title' => 'Session Completed',
                'message' => "The mentoring session \"{$session->title}\" has been completed. You can now view the notes and photo.",
                'data' => ['session_ulid' => $session->ulid],
            ]);
        }
    }
}
