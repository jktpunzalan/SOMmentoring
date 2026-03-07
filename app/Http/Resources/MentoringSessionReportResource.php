<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MentoringSessionReportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ulid' => $this->ulid,
            'mentor' => new UserResource($this->whenLoaded('mentor')),
            'started_at' => $this->started_at?->toISOString(),
            'ended_at' => $this->ended_at?->toISOString(),
            'status' => $this->status,
            'participants' => SessionParticipantResource::collection($this->whenLoaded('participants')),
            'photos' => SessionPhotoResource::collection($this->whenLoaded('photos')),
        ];
    }
}
