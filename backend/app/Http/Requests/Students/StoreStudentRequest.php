<?php

namespace App\Http\Requests\Students;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'application_id' => ['nullable', 'exists:applications,id'],
            'department_id' => ['required', 'exists:departments,id'],
            'student_no' => ['required', 'string', 'max:50', 'unique:students,student_no'],
            'full_name' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', Rule::in(['male', 'female'])],
            'batch' => ['nullable', 'string', 'max:50'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'guardian_name' => ['nullable', 'string', 'max:255'],
            'guardian_phone' => ['nullable', 'string', 'max:30'],
            'photo_path' => ['nullable', 'string', 'max:255'],
            'enrolled_at' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'graduated', 'transferred'])],
        ];
    }
}
