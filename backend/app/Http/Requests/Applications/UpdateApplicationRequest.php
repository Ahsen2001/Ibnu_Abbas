<?php

namespace App\Http\Requests\Applications;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'applicant_name' => ['sometimes', 'string', 'max:255'],
            'date_of_birth' => ['sometimes', 'date'],
            'gender' => ['sometimes', Rule::in(['male', 'female'])],
            'nationality' => ['sometimes', 'string', 'max:100'],
            'religion' => ['sometimes', 'string', 'max:100'],
            'email' => ['sometimes', 'email', 'max:255'],
            'phone' => ['sometimes', 'string', 'max:30'],
            'address' => ['sometimes', 'string'],
            'guardian_name' => ['sometimes', 'string', 'max:255'],
            'guardian_phone' => ['sometimes', 'string', 'max:30'],
            'previous_school' => ['sometimes', 'string', 'max:255'],
            'previous_grade' => ['sometimes', 'string', 'max:100'],
            'department' => ['sometimes', Rule::in(['shareea', 'hifl'])],
            'submit' => ['nullable', 'boolean'],
            'documents' => ['nullable', 'array'],
            'documents.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'existing_documents' => ['nullable', 'array'],
            'existing_documents.*' => ['string'],
        ];
    }
}
