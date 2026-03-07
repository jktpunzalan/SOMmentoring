<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\AppointmentResource;
use App\Http\Resources\MentorMenteeResource;
use App\Http\Resources\MentoringSessionReportResource;
use App\Http\Resources\UserResource;
use App\Services\MentorMenteeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentorMenteeController extends Controller
{
    public function __construct(private MentorMenteeService $service) {}

    public function index(Request $request): JsonResponse
    {
        $mentees = $this->service->getMenteesByMentor($request->user()->id);
        return response()->json(MentorMenteeResource::collection($mentees)->response()->getData(true));
    }

    public function pending(Request $request): JsonResponse
    {
        $pending = $this->service->getPendingByMentor($request->user()->id);
        return response()->json(MentorMenteeResource::collection($pending)->response()->getData(true));
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $result = $this->service->getMenteeDetail($id, $request->user());

        return response()->json([
            'data' => [
                'mentee' => $result['record']->mentee ? new UserResource($result['record']->mentee) : null,
                'record' => new MentorMenteeResource($result['record']),
                'appointments' => AppointmentResource::collection($result['appointments']),
                'sessions' => MentoringSessionReportResource::collection($result['sessions']),
            ],
        ]);
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $record = $this->service->approve($id, $request->user());
        return response()->json(['message' => 'Mentee approved.', 'data' => new MentorMenteeResource($record->load(['mentor', 'mentee']))]);
    }

    public function reject(Request $request, int $id): JsonResponse
    {
        $record = $this->service->reject($id, $request->user(), $request->input('rejection_reason'));
        return response()->json(['message' => 'Mentee rejected.', 'data' => new MentorMenteeResource($record->load(['mentor', 'mentee']))]);
    }
}
