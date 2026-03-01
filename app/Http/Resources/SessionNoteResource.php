<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionNoteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_id' => $this->session_id,
            'agenda' => $this->agenda,
            'key_discussion_points' => $this->key_discussion_points,
            'action_items' => $this->action_items,
            'next_session_date' => $this->next_session_date?->toDateString(),
            'free_text_notes' => $this->free_text_notes,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
