<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HiflProgress extends Model
{
    protected $table = 'hifl_progress';

    protected $fillable = [
        'student_id',
        'teacher_id',
        'recorded_on',
        'sabaq',
        'revision',
        'memorized_pages',
        'completion_percentage',
        'remarks',
    ];
}
