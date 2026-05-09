<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class IslamicLecture extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title',
        'description',
        'speaker_name',
        'speaker_id',
        'category',
        'media_type',
        'file_path',
        'youtube_url',
        'thumbnail_path',
        'duration_minutes',
        'event_date',
        'tags',
        'is_published',
        'views_count',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'title' => 'array',
            'description' => 'array',
            'tags' => 'array',
            'event_date' => 'date',
            'is_published' => 'boolean',
        ];
    }

    public function speaker()
    {
        return $this->belongsTo(User::class, 'speaker_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
