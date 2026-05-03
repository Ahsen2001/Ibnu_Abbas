<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Department extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'code',
        'type',
        'description',
        'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function teachers()
    {
        return $this->hasMany(Teacher::class);
    }

    public function announcements()
    {
        return $this->hasMany(Announcement::class);
    }
}
