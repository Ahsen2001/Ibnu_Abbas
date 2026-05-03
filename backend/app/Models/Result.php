<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Result extends Model
{
    protected $fillable = ['student_id', 'subject_id', 'exam_name', 'marks', 'grade', 'exam_date', 'remarks'];
}
