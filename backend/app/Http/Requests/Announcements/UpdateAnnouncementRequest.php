<?php

namespace App\Http\Requests\Announcements;

use Illuminate\Validation\Rule;

class UpdateAnnouncementRequest extends StoreAnnouncementRequest
{
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'target_audience' => ['sometimes', Rule::in(['all', 'students', 'teachers', 'admin'])],
            'department' => ['nullable', Rule::in(['shareea', 'hifl'])],
            'status' => ['nullable', Rule::in(['draft', 'published', 'archived'])],
            'published_at' => ['nullable', 'date'],
            'expires_at' => ['nullable', 'date', 'after_or_equal:published_at'],
        ];
    }
}
