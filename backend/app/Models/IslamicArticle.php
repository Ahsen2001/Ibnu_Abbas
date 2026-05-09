<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IslamicArticle extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'content',
        'author_name',
        'author_id',
        'category',
        'tags',
        'cover_image_path',
        'is_published',
        'published_at',
        'views_count',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'content' => 'array',
            'tags' => 'array',
            'is_published' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    public function author()
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
