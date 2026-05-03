<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model
{
    use SoftDeletes;

    public const STATUS_ACTIVE = 'active';
    public const STATUS_INACTIVE = 'inactive';
    public const STATUS_GRADUATED = 'graduated';
    public const STATUS_WITHDRAWN = 'withdrawn';

    protected $fillable = [
        'user_id',
        'application_id',
        'student_id',
        'full_name',
        'date_of_birth',
        'gender',
        'nationality',
        'religion',
        'email',
        'department',
        'batch',
        'phone',
        'address',
        'guardian_name',
        'guardian_phone',
        'photo_path',
        'documents',
        'status',
        'enrollment_date',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'enrollment_date' => 'date',
            'documents' => 'array',
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
