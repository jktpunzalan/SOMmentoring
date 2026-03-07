<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'student_id' => $this->when($this->role === 'mentee', $this->student_id),
            'year_level' => $this->when($this->role === 'mentee', $this->year_level),
            'phone' => $this->phone,
            'avatar' => $this->avatar
                ? route('profile.avatar', ['filename' => basename($this->avatar)])
                : null,
            'profile_complete' => $this->profile_complete,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
