<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShareeaRecord extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'student_id',
        'teacher_id',
        'subject_name',
        'subject_code',
        'academic_level',
        'exam_name',
        'exam_date',
        'marks',
        'grade',
        'result_status',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'exam_date' => 'date',
            'marks' => 'decimal:2',
        ];
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function teacher()
    {
        return $this->belongsTo(Teacher::class);
    }
}
