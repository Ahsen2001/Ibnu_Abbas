<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    protected $fillable = [
        'user_id',
        'admission_application_id',
        'department_id',
        'student_no',
        'full_name',
        'batch',
        'guardian_name',
        'guardian_phone',
        'photo_path',
        'status',
        'enrolled_at',
    ];

    protected function casts(): array
    {
        return ['enrolled_at' => 'date'];
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }
}
