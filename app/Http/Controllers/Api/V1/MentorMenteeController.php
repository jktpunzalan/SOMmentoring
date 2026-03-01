<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\MentorMenteeResource;
use App\Services\MentorMenteeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentorMenteeController extends Controller
{
    public function __construct(private MentorMenteeService $service) {}

    public function index(Request $request): JsonResponse
    {
        $mentees = $this->service->getMenteesByMentor($request->user()->id);
        return response()->json(['data' => MentorMenteeResource::collection($mentees)]);
    }

    public function pending(Request $request): JsonResponse
    {
        $pending = $this->service->getPendingByMentor($request->user()->id);
        return response()->json(['data' => MentorMenteeResource::collection($pending)]);
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
