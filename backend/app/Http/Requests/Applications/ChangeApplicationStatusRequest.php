<?php

namespace App\Http\Requests\Applications;

use App\Models\Application;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ChangeApplicationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'status' => ['required', Rule::in([
                Application::STATUS_UNDER_REVIEW,
                Application::STATUS_SHORTLISTED,
                Application::STATUS_INTERVIEW_SCHEDULED,
                Application::STATUS_SELECTED,
                Application::STATUS_REJECTED,
                Application::STATUS_ENROLLED,
            ])],
            'interview_at' => ['nullable', 'date'],
            'admin_notes' => ['nullable', 'string'],
        ];
    }
}
