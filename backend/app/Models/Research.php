<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Research extends Model
{
    use SoftDeletes;

    public const STATUS_PENDING = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    protected $table = 'research_papers';

    protected $fillable = [
        'title',
        'author_name',
        'student_id',
        'supervisor_name',
        'department',
        'year',
        'description',
        'file_path',
        'status',
        'reviewed_by',
        'review_notes',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
