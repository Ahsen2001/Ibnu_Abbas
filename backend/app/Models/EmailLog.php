<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class EmailLog extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'sent_by',
        'subject',
        'template',
        'recipients',
        'recipient_count',
        'audience',
        'status',
        'sent_at',
        'error_message',
    ];

    protected function casts(): array
    {
        return [
            'recipients' => 'array',
            'recipient_count' => 'integer',
            'sent_at' => 'datetime',
        ];
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sent_by');
    }
}
