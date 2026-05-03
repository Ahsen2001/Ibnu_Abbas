<?php

namespace App\Http\Requests\Applications;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'applicant_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date'],
            'gender' => ['required', Rule::in(['male', 'female'])],
            'nationality' => ['required', 'string', 'max:100'],
            'religion' => ['required', 'string', 'max:100'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'address' => ['required', 'string'],
            'guardian_name' => ['required', 'string', 'max:255'],
            'guardian_phone' => ['required', 'string', 'max:30'],
            'previous_school' => ['required', 'string', 'max:255'],
            'previous_grade' => ['required', 'string', 'max:100'],
            'department' => ['required', Rule::in(['shareea', 'hifl'])],
            'documents' => ['nullable', 'array'],
            'documents.*' => ['file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'submission_deadline' => ['nullable', 'date'],
        ];
    }
}
