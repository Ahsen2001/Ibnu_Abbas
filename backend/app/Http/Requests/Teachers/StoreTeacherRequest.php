<?php

namespace App\Http\Requests\Teachers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeacherRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'department_id' => ['nullable', 'exists:departments,id'],
            'employee_no' => ['required', 'string', 'max:50', 'unique:teachers,employee_no'],
            'full_name' => ['required', 'string', 'max:255'],
            'qualification' => ['nullable', 'string', 'max:255'],
            'specialization' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string', 'max:255'],
            'joined_at' => ['nullable', 'date'],
            'status' => ['nullable', Rule::in(['active', 'inactive', 'resigned'])],
        ];
    }
}
