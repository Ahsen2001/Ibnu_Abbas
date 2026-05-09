<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GalleryImage extends Model
{
    protected $fillable = [
        'album_id',
        'image_path',
        'thumbnail_path',
        'caption',
        'sort_order',
        'is_cover',
    ];

    protected function casts(): array
    {
        return [
            'caption' => 'array',
            'is_cover' => 'boolean',
        ];
    }

    public function album()
    {
        return $this->belongsTo(GalleryAlbum::class, 'album_id');
    }
}
