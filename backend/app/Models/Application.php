<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Application extends Model
{
    use SoftDeletes;

    public const STATUS_DRAFT = 'draft';
    public const STATUS_SUBMITTED = 'submitted';
    public const STATUS_UNDER_REVIEW = 'under_review';
    public const STATUS_INTERVIEW_SCHEDULED = 'interview_scheduled';
    public const STATUS_OFFERED = 'offered';
    public const STATUS_ACCEPTED = 'accepted';
    public const STATUS_REJECTED = 'rejected';
    public const STATUS_WITHDRAWN = 'withdrawn';

    protected $fillable = [
        'application_no',
        'applicant_user_id',
        'applicant_name',
        'date_of_birth',
        'gender',
        'nationality',
        'religion',
        'phone',
        'email',
        'address',
        'guardian_name',
        'guardian_phone',
        'previous_school',
        'previous_grade',
        'department',
        'documents',
        'status',
        'interview_date',
        'interview_time',
        'interview_notes',
        'offer_issued_at',
        'submission_deadline',
        'submitted_at',
        'reviewed_by',
        'internal_notes',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'documents' => 'array',
            'interview_date' => 'date',
            'submitted_at' => 'datetime',
            'offer_issued_at' => 'datetime',
            'submission_deadline' => 'datetime',
        ];
    }

    public function applicant()
    {
        return $this->belongsTo(User::class, 'applicant_user_id');
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function canBeEdited(): bool
    {
        return $this->status === self::STATUS_DRAFT
            && (! $this->submission_deadline || now()->lessThanOrEqualTo($this->submission_deadline));
    }
}
