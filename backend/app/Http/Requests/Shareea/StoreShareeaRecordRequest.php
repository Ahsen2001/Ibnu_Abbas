<?php

namespace App\Http\Requests\Shareea;

use Illuminate\Foundation\Http\FormRequest;

class StoreShareeaRecordRequest extends FormRequest
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
            'subject_name' => ['required', 'string', 'max:255'],
            'subject_code' => ['nullable', 'string', 'max:50'],
            'academic_level' => ['nullable', 'string', 'max:100'],
            'exam_name' => ['nullable', 'string', 'max:255'],
            'exam_date' => ['nullable', 'date'],
            'marks' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'grade' => ['nullable', 'string', 'max:20'],
            'result_status' => ['nullable', 'in:pending,passed,failed,withheld'],
            'remarks' => ['nullable', 'string'],
        ];
    }
}
