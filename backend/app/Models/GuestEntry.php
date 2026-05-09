<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuestEntry extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'guest_name',
        'designation',
        'organization',
        'country',
        'message',
        'visit_date',
        'photo_path',
        'is_published',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'visit_date' => 'date',
            'is_published' => 'boolean',
        ];
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
