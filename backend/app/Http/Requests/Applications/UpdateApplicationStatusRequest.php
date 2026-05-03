<?php

namespace App\Http\Requests\Applications;

use App\Models\Application;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateApplicationStatusRequest extends FormRequest
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
                Application::STATUS_INTERVIEW_SCHEDULED,
                Application::STATUS_OFFERED,
                Application::STATUS_ACCEPTED,
                Application::STATUS_REJECTED,
                Application::STATUS_WITHDRAWN,
            ])],
            'internal_notes' => ['nullable', 'string'],
            'interview_notes' => ['nullable', 'string'],
        ];
    }
}
