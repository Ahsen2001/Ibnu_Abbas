<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Teacher extends Model
{
    protected $fillable = [
        'user_id',
        'department_id',
        'employee_no',
        'qualification',
        'specialization',
        'joined_at',
        'status',
    ];
}
