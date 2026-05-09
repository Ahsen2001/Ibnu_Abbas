<?php

namespace App\Http\Requests\Teachers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherRequest extends FormRequest
{
    private const PHOTO_RULES = [
        'nullable',
        'file',
        'mimes:jpg,jpeg,png,webp,bmp,gif,avif,heic,heif',
        'max:10240',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'full_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'qualification' => ['nullable', 'string', 'max:255'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
            'joining_date' => ['nullable', 'date'],
            'department' => ['required', Rule::in(['shareea', 'hifl', 'both'])],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'on_leave'])],
            'photo' => self::PHOTO_RULES,
        ];
    }

    public function messages(): array
    {
        return [
            'photo.mimes' => 'The photo must be a JPG, PNG, WEBP, BMP, GIF, AVIF, HEIC, or HEIF image.',
            'photo.max' => 'The photo must not be larger than 10 MB.',
        ];
    }
}
