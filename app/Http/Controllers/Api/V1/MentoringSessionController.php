<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreSessionRequest;
use App\Http\Resources\MentoringSessionResource;
use App\Services\MentoringSessionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MentoringSessionController extends Controller
{
    public function __construct(private MentoringSessionService $service) {}

    public function index(Request $request): JsonResponse
    {
        $sessions = $this->service->list($request->user(), $request->only(['status', 'per_page']));
        return response()->json(MentoringSessionResource::collection($sessions)->response()->getData(true));
    }

    public function store(StoreSessionRequest $request): JsonResponse
    {
        $session = $this->service->create($request->validated(), $request->user());
        return response()->json(['message' => 'Session started.', 'data' => new MentoringSessionResource($session)], 201);
    }

    public function show(string $ulid, Request $request): JsonResponse
    {
        $session = $this->service->show($ulid);
        $this->authorize('view', $session);
        return response()->json(['data' => new MentoringSessionResource($session)]);
    }

    public function end(string $ulid, Request $request): JsonResponse
    {
        $session = $this->service->endSession($ulid, $request->user());
        return response()->json(['message' => 'Session ended.', 'data' => new MentoringSessionResource($session->load(['notes', 'participants.mentee', 'photos']))]);
    }
}
