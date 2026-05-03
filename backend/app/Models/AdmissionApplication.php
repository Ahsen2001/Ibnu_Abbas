<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdmissionApplication extends Model
{
    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_UNDER_REVIEW = 'under_review';
    public const STATUS_SHORTLISTED = 'shortlisted';
    public const STATUS_INTERVIEW_SCHEDULED = 'interview_scheduled';
    public const STATUS_SELECTED = 'selected';
    public const STATUS_REJECTED = 'rejected';

    protected $fillable = [
        'application_no',
        'applicant_user_id',
        'department_id',
        'full_name',
        'date_of_birth',
        'gender',
        'phone',
        'address',
        'guardian_name',
        'guardian_phone',
        'previous_education',
        'status',
        'submitted_at',
        'edit_deadline_at',
        'interview_at',
        'admin_notes',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'previous_education' => 'array',
            'submitted_at' => 'datetime',
            'edit_deadline_at' => 'datetime',
            'interview_at' => 'datetime',
        ];
    }

    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_user_id');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, [self::STATUS_SUBMITTED, self::STATUS_UNDER_REVIEW], true)
            && $this->edit_deadline_at
            && now()->lessThanOrEqualTo($this->edit_deadline_at);
    }
}
