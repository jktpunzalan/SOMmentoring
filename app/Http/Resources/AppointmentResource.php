<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ulid' => $this->ulid,
            'mentor' => new UserResource($this->whenLoaded('mentor')),
            'proposed_by' => new UserResource($this->whenLoaded('proposedBy')),
            'approved_by' => new UserResource($this->whenLoaded('approvedBy')),
            'title' => $this->title,
            'description' => $this->description,
            'venue' => $this->venue,
            'scheduled_at' => $this->scheduled_at?->toISOString(),
            'duration_minutes' => $this->duration_minutes,
            'end_time' => $this->scheduled_at?->copy()->addMinutes($this->duration_minutes)->toISOString(),
            'is_group' => $this->is_group,
            'max_participants' => $this->max_participants,
            'status' => $this->status,
            'rejection_reason' => $this->when($this->status === 'rejected', $this->rejection_reason),
            'approved_at' => $this->approved_at?->toISOString(),
            'mentees' => SessionParticipantResource::collection($this->whenLoaded('mentees')),
            'session' => new MentoringSessionResource($this->whenLoaded('session')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
