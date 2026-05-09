<?php

namespace App\Http\Requests\Research;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateResearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'author_name' => ['sometimes', 'required', 'string', 'max:255'],
            'student_id' => ['nullable', 'exists:students,id'],
            'supervisor_name' => ['sometimes', 'required', 'string', 'max:255'],
            'department' => ['sometimes', 'required', Rule::in(['shareea', 'hifl'])],
            'year' => ['sometimes', 'required', 'integer', 'min:2000', 'max:' . (now()->year + 1)],
            'description' => ['nullable', 'string'],
        ];
    }
}
