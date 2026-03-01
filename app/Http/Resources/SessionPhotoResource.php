<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionPhotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'session_id' => $this->session_id,
            'file_name' => $this->file_name,
            'captured_at' => $this->captured_at?->toISOString(),
            'uploaded_by' => new UserResource($this->whenLoaded('uploadedBy')),
            'download_url' => $this->when(
                $this->session,
                fn () => url("/api/v1/sessions/{$this->session->ulid}/photos/{$this->id}/download")
            ),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
