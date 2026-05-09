<?php

namespace App\Http\Requests\EmailTemplates;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmailTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $templateId = $this->route('emailTemplate')?->id ?? $this->route('template')?->id;

        return [
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('email_templates', 'name')->ignore($templateId)],
            'subject' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'variables' => ['nullable', 'array'],
            'variables.*' => ['string', 'max:100'],
            'category' => ['sometimes', Rule::in(['admission', 'academic', 'general', 'alert'])],
        ];
    }
}
