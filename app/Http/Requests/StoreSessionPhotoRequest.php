<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreSessionPhotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isMentor();
    }

    public function rules(): array
    {
        return [
            'photo' => ['required', 'file', 'mimes:jpeg,jpg,png,webp', 'max:10240'],
        ];
    }
}
