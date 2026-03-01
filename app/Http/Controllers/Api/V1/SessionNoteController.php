<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateSessionNoteRequest;
use App\Http\Resources\SessionNoteResource;
use App\Services\SessionNoteService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionNoteController extends Controller
{
    public function __construct(private SessionNoteService $service) {}

    public function show(string $ulid): JsonResponse
    {
        $note = $this->service->getBySession($ulid);
        return response()->json(['data' => $note ? new SessionNoteResource($note) : null]);
    }

    public function store(UpdateSessionNoteRequest $request, string $ulid): JsonResponse
    {
        $note = $this->service->createOrUpdate($ulid, $request->validated(), $request->user());
        return response()->json(['message' => 'Notes saved.', 'data' => new SessionNoteResource($note)], 201);
    }

    public function update(UpdateSessionNoteRequest $request, string $ulid): JsonResponse
    {
        $note = $this->service->createOrUpdate($ulid, $request->validated(), $request->user());
        return response()->json(['message' => 'Notes updated.', 'data' => new SessionNoteResource($note)]);
    }
}
