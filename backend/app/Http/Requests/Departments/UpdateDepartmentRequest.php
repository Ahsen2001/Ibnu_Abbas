<?php

namespace App\Http\Requests\Departments;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $departmentId = $this->route('department')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('departments', 'name')->ignore($departmentId)],
            'code' => ['sometimes', 'string', 'max:30', Rule::unique('departments', 'code')->ignore($departmentId)],
            'type' => ['sometimes', 'in:shareea,hifl'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
