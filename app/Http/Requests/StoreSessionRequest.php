<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isMentor();
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'appointment_id' => ['nullable', 'exists:appointments,id'],
            'mentee_ids' => ['nullable', 'array', 'min:1', 'max:15'],
            'mentee_ids.*' => ['exists:users,id'],
        ];
    }
}
