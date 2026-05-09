<?php

namespace App\Http\Requests\Calendar;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAcademicCalendarRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'event_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:event_date'],
            'event_type' => ['sometimes', Rule::in(['holiday', 'exam', 'registration', 'other'])],
            'department' => ['nullable', Rule::in(['shareea', 'hifl'])],
        ];
    }
}
