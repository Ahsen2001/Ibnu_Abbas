<?php

namespace App\Http\Requests\Hifl;

use Illuminate\Foundation\Http\FormRequest;

class StoreHiflProgressRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'exists:students,id'],
            'teacher_id' => ['nullable', 'exists:teachers,id'],
            'recorded_on' => ['required', 'date'],
            'sabaq' => ['nullable', 'string', 'max:255'],
            'sabaq_para' => ['nullable', 'string', 'max:100'],
            'revision' => ['nullable', 'string', 'max:255'],
            'revision_para' => ['nullable', 'string', 'max:100'],
            'memorized_pages' => ['nullable', 'integer', 'min:0', 'max:604'],
            'revised_pages' => ['nullable', 'integer', 'min:0', 'max:604'],
            'completion_percentage' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'quality_rating' => ['nullable', 'in:excellent,good,average,needs_revision'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}
