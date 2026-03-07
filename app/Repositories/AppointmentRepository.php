<?php

namespace App\Repositories;

use App\Models\Appointment;
use App\Models\AppointmentMentee;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class AppointmentRepository
{
    public function findById(int $id): ?Appointment
    {
        return Appointment::with(['mentor', 'proposedBy', 'mentees.mentee'])->find($id);
    }

    public function findByUlid(string $ulid): ?Appointment
    {
        return Appointment::with(['mentor', 'proposedBy', 'mentees.mentee', 'session'])
            ->where('ulid', $ulid)->first();
    }

    public function getByMentor(int $mentorId, array $filters = []): LengthAwarePaginator
    {
        $query = Appointment::with(['proposedBy', 'mentees.mentee'])
            ->where('mentor_id', $mentorId);

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('scheduled_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function getByMentee(int $menteeId, array $filters = []): LengthAwarePaginator
    {
        $query = Appointment::with(['mentor', 'proposedBy'])
            ->whereHas('mentees', fn ($q) => $q->where('mentee_id', $menteeId));

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query->orderBy('scheduled_at', 'desc')->paginate($filters['per_page'] ?? 15);
    }

    public function getCalendarData(int $userId, string $role, string $startDate, string $endDate): Collection
    {
        $query = Appointment::with(['mentor', 'mentees.mentee'])
            ->whereBetween('scheduled_at', [$startDate, $endDate]);

        if ($role === 'mentor') {
            $query->where('mentor_id', $userId);
        } elseif ($role === 'mentee') {
            $query->whereHas('mentees', fn ($q) => $q->where('mentee_id', $userId));
        }

        return $query->orderBy('scheduled_at')->get();
    }

    public function getAvailableSlots(int $mentorId, int $menteeId): Collection
    {
        return Appointment::with(['mentor', 'mentees.mentee'])
            ->where('mentor_id', $mentorId)
            ->where('status', 'open')
            ->where('scheduled_at', '>', now())
            ->orderBy('scheduled_at')
            ->get();
    }

    public function hasOverlap(int $mentorId, string $scheduledAt, int $durationMinutes, ?int $excludeId = null): bool
    {
        $startTime = $scheduledAt;
        $endTime = \Carbon\Carbon::parse($scheduledAt)->addMinutes($durationMinutes)->toDateTimeString();

        $query = Appointment::where('mentor_id', $mentorId)
            ->where('status', 'approved');

        $driver = Appointment::query()->getConnection()->getDriverName();
        if ($driver === 'sqlite') {
            $startBound = \Carbon\Carbon::parse($startTime)->subMinutes($durationMinutes)->toDateTimeString();
            $query->where('scheduled_at', '<', $endTime)
                ->where('scheduled_at', '>', $startBound);
        } else {
            $query->where(function ($q) use ($startTime, $endTime) {
                $q->where(function ($inner) use ($startTime, $endTime) {
                    $inner->where('scheduled_at', '<', $endTime)
                          ->whereRaw('DATE_ADD(scheduled_at, INTERVAL duration_minutes MINUTE) > ?', [$startTime]);
                });
            });
        }

        if ($excludeId) {
            $query->where('id', '!=', $excludeId);
        }

        return $query->exists();
    }

    public function create(array $data): Appointment
    {
        return Appointment::create($data);
    }

    public function update(Appointment $appointment, array $data): Appointment
    {
        $appointment->update($data);
        return $appointment->fresh();
    }

    public function removeMenteeFromAppointment(int $appointmentId, int $menteeId): int
    {
        return AppointmentMentee::where('appointment_id', $appointmentId)
            ->where('mentee_id', $menteeId)
            ->delete();
    }
}
