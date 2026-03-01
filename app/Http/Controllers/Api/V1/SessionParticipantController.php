<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\SessionParticipantResource;
use App\Models\MentoringSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionParticipantController extends Controller
{
    public function index(string $ulid): JsonResponse
    {
        $session = MentoringSession::where('ulid', $ulid)->firstOrFail();
        $participants = $session->participants()->with('mentee')->get();
        return response()->json(['data' => SessionParticipantResource::collection($participants)]);
    }

    public function store(Request $request, string $ulid): JsonResponse
    {
        $session = MentoringSession::where('ulid', $ulid)->firstOrFail();
        abort_if($session->mentor_id !== $request->user()->id, 403, 'Unauthorized.');
        abort_if(!$session->isOngoing(), 422, 'Session is not ongoing.');

        $request->validate([
            'mentee_ids' => ['required', 'array', 'min:1', 'max:15'],
            'mentee_ids.*' => ['exists:users,id'],
        ]);

        foreach ($request->input('mentee_ids') as $menteeId) {
            $session->participants()->updateOrCreate(
                ['mentee_id' => $menteeId],
                ['attended' => true, 'joined_at' => now()]
            );
        }

        return response()->json(['message' => 'Participants updated.', 'data' => SessionParticipantResource::collection($session->participants()->with('mentee')->get())]);
    }
}
