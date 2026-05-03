<?php

namespace App\Http\Requests\Announcements;

class UpdateAnnouncementRequest extends StoreAnnouncementRequest
{
    public function rules(): array
    {
        return [
            'department_id' => ['nullable', 'exists:departments,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'body' => ['sometimes', 'string'],
            'audience' => ['nullable', 'in:all,applicants,students,teachers,shareea,hifl,admin'],
            'pdf_path' => ['nullable', 'string', 'max:255'],
            'is_published' => ['nullable', 'boolean'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
