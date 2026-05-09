<?php

namespace App\Http\Requests\Research;

use Illuminate\Foundation\Http\FormRequest;

class RejectResearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'review_notes' => ['required', 'string', 'max:2000'],
        ];
    }
}
