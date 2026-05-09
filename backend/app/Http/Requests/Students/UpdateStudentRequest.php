<?php

namespace App\Http\Requests\Students;

use App\Models\Application;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest
{
    private const PHOTO_RULES = [
        'nullable',
        'file',
        'mimes:jpg,jpeg,png,webp,bmp,gif,avif,heic,heif',
        'max:5120',
    ];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'application_id' => [
                'nullable',
                'string',
                'max:255',
                function (string $attribute, mixed $value, \Closure $fail) {
                    $reference = trim((string) $value);

                    if ($reference === '') {
                        return;
                    }

                    $exists = Application::query()
                        ->whereKey(is_numeric($reference) ? (int) $reference : $reference)
                        ->orWhere('application_no', $reference)
                        ->exists();

                    if (! $exists) {
                        $fail('The selected application reference is invalid.');
                    }
                },
            ],
            'full_name' => ['sometimes', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'nationality' => ['nullable', 'string', 'max:100'],
            'religion' => ['nullable', 'string', 'max:100'],
            'email' => ['nullable', 'email', 'max:255'],
            'batch' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'department' => ['nullable', Rule::in(['shareea', 'hifl'])],
            'enrollment_date' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'graduated', 'withdrawn'])],
            'photo' => self::PHOTO_RULES,
            'remove_photo' => ['nullable', 'boolean'],
            'documents' => ['nullable', 'array'],
            'documents.*' => ['file', 'max:8192'],
            'existing_documents' => ['nullable', 'array'],
            'existing_documents.*' => ['string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'photo.mimes' => 'The photo must be a JPG, PNG, WEBP, BMP, GIF, AVIF, HEIC, or HEIF image.',
        ];
    }
}
