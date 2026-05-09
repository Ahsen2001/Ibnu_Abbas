<?php

namespace App\Http\Requests\Email;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SendBulkEmailRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'recipient_filter' => ['required', Rule::in(['all_users', 'all_students', 'all_teachers', 'department', 'batch', 'custom_list'])],
            'department' => ['nullable', Rule::in(['shareea', 'hifl'])],
            'batch' => ['nullable', 'string', 'max:20'],
            'custom_emails' => ['nullable', 'string'],
            'template_id' => ['nullable', 'exists:email_templates,id'],
            'subject' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'variables' => ['nullable', 'array'],
        ];
    }
}
