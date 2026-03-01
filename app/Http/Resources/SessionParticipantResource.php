<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionParticipantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'mentee' => new UserResource($this->whenLoaded('mentee')),
            'mentee_id' => $this->mentee_id,
            'attended' => $this->attended,
            'joined_at' => $this->joined_at?->toISOString(),
            'status' => $this->when(isset($this->status), $this->status),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
