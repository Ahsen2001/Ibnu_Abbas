<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'department_id',
        'employee_no',
        'full_name',
        'qualification',
        'specialization',
        'phone',
        'address',
        'joined_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
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
