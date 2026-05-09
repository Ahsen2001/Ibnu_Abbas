<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IssuedDocument extends Model
{
    protected $fillable = [
        'student_id',
        'application_id',
        'created_by',
        'document_type',
        'title',
        'file_disk',
        'file_path',
        'metadata',
        'issued_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'issued_at' => 'datetime',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
