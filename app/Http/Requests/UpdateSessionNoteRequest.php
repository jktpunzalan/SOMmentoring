<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSessionNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isMentor();
    }

    public function rules(): array
    {
        return [
            'agenda' => ['nullable', 'string'],
            'key_discussion_points' => ['nullable', 'string'],
            'action_items' => ['nullable', 'string'],
            'next_session_date' => ['nullable', 'date'],
            'free_text_notes' => ['nullable', 'string'],
        ];
    }
}
