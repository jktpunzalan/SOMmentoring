<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\MentoringSession;
use App\Models\User;
use App\Repositories\MentorMenteeRepository;
use App\Repositories\MentoringSessionRepository;
use App\Repositories\NotificationRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        private MentorMenteeRepository $mentorMenteeRepo,
        private MentoringSessionRepository $sessionRepo,
        private NotificationRepository $notificationRepo,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isSuperAdmin()) {
            return response()->json($this->adminDashboard());
        }

        if ($user->isMentor()) {
            return response()->json($this->mentorDashboard($user));
        }

        return response()->json($this->menteeDashboard($user));
    }

    private function adminDashboard(): array
    {
        return [
            'total_users' => User::count(),
            'total_mentors' => User::where('role', 'mentor')->count(),
            'total_mentees' => User::where('role', 'mentee')->count(),
            'total_appointments' => Appointment::count(),
            'total_sessions' => MentoringSession::count(),
            'pending_registrations' => \App\Models\MentorMentee::where('status', 'pending')->count(),
        ];
    }

    private function mentorDashboard(User $user): array
    {
        $ongoingSession = $this->sessionRepo->getOngoingSession($user->id);

        return [
            'total_mentees' => $this->mentorMenteeRepo->getApprovedByMentor($user->id)->count(),
            'pending_mentees' => $this->mentorMenteeRepo->getPendingByMentor($user->id)->count(),
            'upcoming_appointments' => Appointment::where('mentor_id', $user->id)
                ->where('status', 'approved')
                ->where('scheduled_at', '>=', now())
                ->count(),
            'completed_sessions' => MentoringSession::where('mentor_id', $user->id)
                ->where('status', 'completed')
                ->count(),
            'ongoing_session' => $ongoingSession ? [
                'ulid' => $ongoingSession->ulid,
                'title' => $ongoingSession->title,
                'started_at' => $ongoingSession->started_at->toISOString(),
            ] : null,
            'unread_notifications' => $this->notificationRepo->getUnreadCount($user->id),
        ];
    }

    private function menteeDashboard(User $user): array
    {
        return [
            'upcoming_appointments' => Appointment::whereHas('mentees', fn ($q) => $q->where('mentee_id', $user->id))
                ->where('status', 'approved')
                ->where('scheduled_at', '>=', now())
                ->count(),
            'completed_sessions' => MentoringSession::whereHas('participants', fn ($q) => $q->where('mentee_id', $user->id))
                ->where('status', 'completed')
                ->count(),
            'unread_notifications' => $this->notificationRepo->getUnreadCount($user->id),
        ];
    }
}
