<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MentoringSessionReportResource;
use App\Http\Resources\UserResource;
use App\Models\MentoringSession;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    private function validateRange(Request $request): array
    {
        return $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after_or_equal:start'],
            'mentor_id' => ['nullable', 'integer'],
        ]);
    }

    public function mentor(Request $request): JsonResponse
    {
        $filters = $this->validateRange($request);
        $user = $request->user();

        $mentorId = $user->isSuperAdmin() && !empty($filters['mentor_id'])
            ? (int) $filters['mentor_id']
            : (int) $user->id;

        $sessionsQuery = MentoringSession::with(['mentor', 'participants.mentee', 'photos'])
            ->where('status', 'completed')
            ->where('mentor_id', $mentorId)
            ->whereNotNull('ended_at')
            ->whereBetween(DB::raw('date(ended_at)'), [$filters['start'], $filters['end']])
            ->orderBy('started_at', 'desc');

        $sessions = $sessionsQuery->get();

        $menteeCounts = DB::table('session_participants')
            ->join('mentoring_sessions', 'mentoring_sessions.id', '=', 'session_participants.session_id')
            ->where('mentoring_sessions.status', 'completed')
            ->where('mentoring_sessions.mentor_id', $mentorId)
            ->whereNotNull('mentoring_sessions.ended_at')
            ->whereBetween(DB::raw('date(mentoring_sessions.ended_at)'), [$filters['start'], $filters['end']])
            ->select('session_participants.mentee_id', DB::raw('COUNT(DISTINCT mentoring_sessions.id) as completed_sessions'))
            ->groupBy('session_participants.mentee_id')
            ->orderByDesc('completed_sessions')
            ->get();

        $menteeUsers = User::whereIn('id', $menteeCounts->pluck('mentee_id')->all())->get()->keyBy('id');

        $menteeCountsPayload = $menteeCounts->map(function ($row) use ($menteeUsers) {
            $u = $menteeUsers->get($row->mentee_id);
            return [
                'mentee' => $u ? new UserResource($u) : null,
                'mentee_id' => (int) $row->mentee_id,
                'completed_sessions' => (int) $row->completed_sessions,
            ];
        });

        return response()->json([
            'data' => [
                'sessions' => MentoringSessionReportResource::collection($sessions),
                'mentee_counts' => $menteeCountsPayload,
            ],
        ]);
    }

    public function mentee(Request $request): JsonResponse
    {
        $filters = $this->validateRange($request);
        $user = $request->user();

        $sessions = MentoringSession::with(['mentor', 'participants.mentee', 'photos'])
            ->where('status', 'completed')
            ->whereHas('participants', fn ($q) => $q->where('mentee_id', $user->id))
            ->whereNotNull('ended_at')
            ->whereBetween(DB::raw('date(ended_at)'), [$filters['start'], $filters['end']])
            ->orderBy('started_at', 'desc')
            ->get();

        return response()->json([
            'data' => [
                'sessions' => MentoringSessionReportResource::collection($sessions),
            ],
        ]);
    }

    public function admin(Request $request): JsonResponse
    {
        $filters = $this->validateRange($request);

        $sessions = MentoringSession::with(['mentor', 'participants.mentee', 'photos'])
            ->where('status', 'completed')
            ->whereNotNull('ended_at')
            ->whereBetween(DB::raw('date(ended_at)'), [$filters['start'], $filters['end']])
            ->orderBy('started_at', 'desc')
            ->get();

        $mentorSummaries = MentoringSession::query()
            ->where('status', 'completed')
            ->whereNotNull('ended_at')
            ->whereBetween(DB::raw('date(ended_at)'), [$filters['start'], $filters['end']])
            ->select('mentor_id', DB::raw('COUNT(*) as completed_sessions'))
            ->groupBy('mentor_id')
            ->orderByDesc('completed_sessions')
            ->get();

        $mentorUsers = User::whereIn('id', $mentorSummaries->pluck('mentor_id')->all())->get()->keyBy('id');
        $mentorSummariesPayload = $mentorSummaries->map(function ($row) use ($mentorUsers) {
            $u = $mentorUsers->get($row->mentor_id);
            return [
                'mentor' => $u ? new UserResource($u) : null,
                'mentor_id' => (int) $row->mentor_id,
                'completed_sessions' => (int) $row->completed_sessions,
            ];
        });

        $mentorMenteeCounts = DB::table('session_participants')
            ->join('mentoring_sessions', 'mentoring_sessions.id', '=', 'session_participants.session_id')
            ->where('mentoring_sessions.status', 'completed')
            ->whereNotNull('mentoring_sessions.ended_at')
            ->whereBetween(DB::raw('date(mentoring_sessions.ended_at)'), [$filters['start'], $filters['end']])
            ->select('mentoring_sessions.mentor_id', 'session_participants.mentee_id', DB::raw('COUNT(DISTINCT mentoring_sessions.id) as completed_sessions'))
            ->groupBy('mentoring_sessions.mentor_id', 'session_participants.mentee_id')
            ->orderByDesc('completed_sessions')
            ->get();

        $menteeUsers = User::whereIn('id', $mentorMenteeCounts->pluck('mentee_id')->all())->get()->keyBy('id');

        $mentorMenteePayload = $mentorMenteeCounts->map(function ($row) use ($mentorUsers, $menteeUsers) {
            $mentor = $mentorUsers->get($row->mentor_id);
            $mentee = $menteeUsers->get($row->mentee_id);

            return [
                'mentor' => $mentor ? new UserResource($mentor) : null,
                'mentor_id' => (int) $row->mentor_id,
                'mentee' => $mentee ? new UserResource($mentee) : null,
                'mentee_id' => (int) $row->mentee_id,
                'completed_sessions' => (int) $row->completed_sessions,
            ];
        });

        return response()->json([
            'data' => [
                'sessions' => MentoringSessionReportResource::collection($sessions),
                'mentor_summaries' => $mentorSummariesPayload,
                'mentor_mentee_counts' => $mentorMenteePayload,
            ],
        ]);
    }
}
