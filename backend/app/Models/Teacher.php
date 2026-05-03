<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_ON_LEAVE = 'on_leave';

    protected $fillable = [
        'user_id',
        'employee_id',
        'full_name',
        'date_of_birth',
        'gender',
        'qualification',
        'specialization',
        'email',
        'phone',
        'address',
        'joining_date',
        'department',
        'status',
        'photo_path',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'joining_date' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function shareeaRecords()
    {
        return $this->hasMany(ShareeaRecord::class);
    }

    public function hiflProgress()
    {
        return $this->hasMany(HiflProgress::class);
    }

    public function attendance()
    {
        return $this->hasMany(Attendance::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'teacher_subjects')
            ->withPivot('academic_year')
            ->withTimestamps();
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'student_teacher')
            ->withPivot('academic_year')
            ->withTimestamps();
    }
}
