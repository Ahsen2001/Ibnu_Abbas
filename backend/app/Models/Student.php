<?php

namespace App\Models;

use Carbon\Carbon;
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

    protected $appends = [
        'enrollment_timestamp',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'enrollment_date' => 'datetime',
            'documents' => 'array',
        ];
    }

    public function getEnrollmentTimestampAttribute(): ?string
    {
        $enrollment = $this->enrollment_date instanceof Carbon
            ? $this->enrollment_date->copy()
            : ($this->enrollment_date ? Carbon::parse($this->enrollment_date) : null);

        if (! $enrollment) {
            return $this->created_at?->toISOString();
        }

        if (
            $enrollment->format('H:i:s') === '00:00:00'
            && $this->created_at instanceof Carbon
        ) {
            $enrollment->setTimeFrom($this->created_at);
        }

        return $enrollment->toISOString();
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

    public function teachers()
    {
        return $this->belongsToMany(Teacher::class, 'student_teacher')
            ->withPivot('academic_year')
            ->withTimestamps();
    }

    public function researchPapers()
    {
        return $this->hasMany(Research::class);
    }

    public function issuedDocuments()
    {
        return $this->hasMany(IssuedDocument::class);
    }
}
