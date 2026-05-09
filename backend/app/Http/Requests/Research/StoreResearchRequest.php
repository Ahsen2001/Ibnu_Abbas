<?php

namespace App\Http\Requests\Research;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'author_name' => ['required', 'string', 'max:255'],
            'student_id' => ['nullable', 'exists:students,id'],
            'supervisor_name' => ['required', 'string', 'max:255'],
            'department' => ['required', Rule::in(['shareea', 'hifl'])],
            'year' => ['required', 'integer', 'min:2000', 'max:' . (now()->year + 1)],
            'description' => ['nullable', 'string'],
            'file' => ['required', 'file', 'mimes:pdf', 'max:20480'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'Only PDF research papers can be uploaded.',
            'file.max' => 'Research papers must not be larger than 20 MB.',
        ];
    }
}
