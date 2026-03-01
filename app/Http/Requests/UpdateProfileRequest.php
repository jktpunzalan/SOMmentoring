<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users')->ignore($this->user()->id)],
            'phone' => ['nullable', 'string', 'max:50'],
            'year_level' => ['nullable', 'string', 'max:50'],
            'student_id' => ['nullable', 'string', 'max:100'],
            'avatar' => ['nullable', 'file', 'image', 'max:2048'],
        ];
    }
}
