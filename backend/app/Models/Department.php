<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    protected $fillable = ['name', 'code', 'description', 'is_active'];

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
        return $this->hasMany(AdmissionApplication::class);
    }
}
