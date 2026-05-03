<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['department_id', 'teacher_id', 'name', 'code', 'level', 'is_active'];
}
