<?php

namespace App\Http\Requests\Hifl;

class UpdateHiflProgressRequest extends StoreHiflProgressRequest
{
    public function rules(): array
    {
        return [
            'student_id' => ['sometimes', 'exists:students,id'],
            'teacher_id' => ['nullable', 'exists:teachers,id'],
            'recorded_on' => ['sometimes', 'date'],
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
