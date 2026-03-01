<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use App\Repositories\MentorMenteeRepository;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        private UserRepository $userRepository,
        private MentorMenteeRepository $mentorMenteeRepository,
        private NotificationService $notificationService,
    ) {}

    public function registerMentee(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = $this->userRepository->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'role' => 'mentee',
                'student_id' => $data['student_id'] ?? null,
                'course' => $data['course'] ?? null,
                'year_level' => $data['year_level'] ?? null,
                'department' => $data['department'] ?? null,
                'phone' => $data['phone'] ?? null,
            ]);

            $this->mentorMenteeRepository->create([
                'mentor_id' => $data['mentor_id'],
                'mentee_id' => $user->id,
                'status' => 'pending',
            ]);

            $this->notificationService->notifyMenteeRegistration($user, $data['mentor_id']);

            return $user;
        });
    }

    public function login(array $credentials): User
    {
        $user = $this->userRepository->findByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if ($user->isMentee()) {
            $mentorMentee = $this->mentorMenteeRepository->findByMenteeId($user->id);
            if ($mentorMentee && $mentorMentee->status !== 'approved') {
                throw ValidationException::withMessages([
                    'email' => ['Your registration is still pending approval.'],
                ]);
            }
        }

        Auth::login($user);

        request()->session()->regenerate();
        request()->session()->regenerateToken();

        return $user;
    }

    public function logout(): void
    {
        Auth::guard('web')->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }
}
