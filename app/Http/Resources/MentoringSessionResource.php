<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MentoringSessionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ulid' => $this->ulid,
            'appointment_id' => $this->appointment_id,
            'mentor' => new UserResource($this->whenLoaded('mentor')),
            'title' => $this->title,
            'started_at' => $this->started_at?->toISOString(),
            'ended_at' => $this->ended_at?->toISOString(),
            'status' => $this->status,
            'notes' => $this->when(
                !$request->user()?->isSuperAdmin(),
                fn () => new SessionNoteResource($this->whenLoaded('notes'))
            ),
            'participants' => SessionParticipantResource::collection($this->whenLoaded('participants')),
            'photos' => SessionPhotoResource::collection($this->whenLoaded('photos')),
            'appointment' => new AppointmentResource($this->whenLoaded('appointment')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
