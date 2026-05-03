<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'application_id',
        'department_id',
        'student_no',
        'full_name',
        'date_of_birth',
        'gender',
        'batch',
        'phone',
        'address',
        'guardian_name',
        'guardian_phone',
        'photo_path',
        'status',
        'enrolled_at',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'enrolled_at' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function application()
    {
        return $this->belongsTo(Application::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
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
}
