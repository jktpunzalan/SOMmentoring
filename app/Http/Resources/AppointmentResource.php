<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $durationMinutes = (int) ($this->duration_minutes ?? 0);
        $enrolledCount = $this->relationLoaded('mentees') ? $this->mentees->count() : null;
        $remainingSlots = null;
        if ($enrolledCount !== null && $this->max_participants !== null) {
            $remainingSlots = max(0, ((int) $this->max_participants) - $enrolledCount);
        }

        $displayStatus = $this->status;
        if ($this->status === 'open' && $remainingSlots !== null && $remainingSlots <= 0) {
            $displayStatus = 'closed';
        }

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
            'duration_minutes' => $durationMinutes,
            'end_time' => $this->scheduled_at?->copy()->addMinutes($durationMinutes)->toISOString(),
            'is_group' => $this->is_group,
            'max_participants' => $this->max_participants,
            'status' => $this->status,
            'display_status' => $displayStatus,
            'enrolled_count' => $enrolledCount,
            'remaining_slots' => $remainingSlots,
            'rejection_reason' => $this->when($this->status === 'rejected', $this->rejection_reason),
            'approved_at' => $this->approved_at?->toISOString(),
            'mentees' => SessionParticipantResource::collection($this->whenLoaded('mentees')),
            'session' => new MentoringSessionResource($this->whenLoaded('session')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
