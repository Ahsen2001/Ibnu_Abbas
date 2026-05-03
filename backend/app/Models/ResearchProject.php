<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ResearchProject extends Model
{
    protected $fillable = ['student_id', 'supervisor_id', 'title', 'author', 'year', 'file_path', 'status'];
}
