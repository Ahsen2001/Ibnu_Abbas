<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailTemplate extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'subject',
        'body',
        'variables',
        'category',
    ];

    protected function casts(): array
    {
        return [
            'variables' => 'array',
        ];
    }
}
