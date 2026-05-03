<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Announcement extends Model
{
    protected $fillable = ['created_by', 'title', 'body', 'audience', 'pdf_path', 'published_at'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }
}
