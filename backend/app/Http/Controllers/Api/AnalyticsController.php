<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\Application;
use App\Models\Attendance;
use App\Models\EmailLog;
use App\Models\HiflProgress;
use App\Models\ShareeaRecord;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class AnalyticsController extends Controller
{
    private const ATTENDED_STATUSES = ['present', 'late', 'excused'];

    private const GRADE_ORDER = ['A+', 'A', 'B+', 'B', 'C', 'D', 'F'];

    private const GPA_MAP = [
        'A+' => 4.00,
        'A' => 4.00,
        'A-' => 3.70,
        'B+' => 3.30,
        'B' => 3.00,
        'B-' => 2.70,
        'C+' => 2.30,
        'C' => 2.00,
        'C-' => 1.70,
        'D+' => 1.30,
        'D' => 1.00,
        'F' => 0.00,
    ];

    private const ADMISSION_STATUS_LABELS = [
        Application::STATUS_DRAFT => 'Draft',
        Application::STATUS_SUBMITTED => 'Submitted',
        Application::STATUS_UNDER_REVIEW => 'Under Review',
        Application::STATUS_INTERVIEW_SCHEDULED => 'Interview',
        Application::STATUS_OFFERED => 'Offered',
        Application::STATUS_ACCEPTED => 'Accepted',
        Application::STATUS_REJECTED => 'Rejected',
        Application::STATUS_WITHDRAWN => 'Withdrawn',
    ];

    public function overview(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $year = $filters['year'] ?? null;
        $department = $filters['department'] ?? null;

        $pendingStatuses = [
            Application::STATUS_SUBMITTED,
            Application::STATUS_UNDER_REVIEW,
            Application::STATUS_INTERVIEW_SCHEDULED,
            Application::STATUS_OFFERED,
        ];

        $todayAttendanceRecords = $this->attendanceAnalyticsQuery(null, $department, false)
            ->whereDate('date', now()->toDateString())
            ->get();

        $announcementsThisMonth = $this->announcementAnalyticsQuery($department)
            ->where('status', 'published')
            ->whereYear('published_at', $year ?? now()->year)
            ->whereMonth('published_at', now()->month)
            ->count();

        $emailsSentThisMonth = $this->emailAnalyticsQuery($year, $department, false)
            ->where('status', 'sent')
            ->whereYear('sent_at', $year ?? now()->year)
            ->whereMonth('sent_at', now()->month)
            ->count();

        return response()->json([
            'filters' => $this->filterPayload($year, $department),
            'stats' => [
                'total_students' => $this->studentAnalyticsQuery($year, $department)
                    ->where('status', Student::STATUS_ACTIVE)
                    ->count(),
                'total_teachers' => $this->teacherAnalyticsQuery($year, $department)->count(),
                'pending_applications' => $this->applicationAnalyticsQuery($year, $department)
                    ->whereIn('status', $pendingStatuses)
                    ->count(),
                'today_attendance_percentage' => $this->attendancePercentage($todayAttendanceRecords),
                'announcements_this_month' => $announcementsThisMonth,
                'emails_sent_this_month' => $emailsSentThisMonth,
            ],
        ]);
    }

    public function admissionStats(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $year = $filters['year'] ?? null;
        $department = $filters['department'] ?? null;

        $applications = $this->applicationAnalyticsQuery($year, $department)->get();

        $statuses = collect(self::ADMISSION_STATUS_LABELS)
            ->map(fn (string $label, string $status) => [
                'status' => $status,
                'label' => $label,
                'count' => $applications->where('status', $status)->count(),
            ])
            ->values();

        return response()->json([
            'filters' => $this->filterPayload($year, $department),
            'total_applications' => $applications->count(),
            'statuses' => $statuses,
        ]);
    }

    public function studentStats(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $year = $filters['year'] ?? null;
        $department = $filters['department'] ?? null;

        $students = $this->studentAnalyticsQuery($year, $department)->get();
        $departments = $department ? [$department] : ['shareea', 'hifl'];

        $byDepartment = collect($departments)
            ->map(fn (string $departmentName) => [
                'department' => $departmentName,
                'count' => $students->where('department', $departmentName)->count(),
            ])
            ->values();

        $byGender = collect(['male', 'female'])
            ->map(fn (string $gender) => [
                'gender' => $gender,
                'count' => $students->where('gender', $gender)->count(),
            ])
            ->values();

        $byBatch = $students
            ->groupBy(fn (Student $student) => $student->batch ?: ($student->enrollment_date?->format('Y') ?? 'Unknown'))
            ->map(fn (Collection $items, string $batch) => [
                'batch' => $batch,
                'count' => $items->count(),
            ])
            ->sortBy('batch', SORT_NATURAL)
            ->values();

        return response()->json([
            'filters' => $this->filterPayload($year, $department),
            'totals' => [
                'students' => $students->count(),
            ],
            'by_department' => $byDepartment,
            'by_gender' => $byGender,
            'by_batch' => $byBatch,
        ]);
    }

    public function attendanceStats(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $year = $filters['year'] ?? null;
        $department = $filters['department'] ?? null;
        $resolvedYear = $year ?? now()->year;

        $attendance = $this->attendanceAnalyticsQuery($resolvedYear, $department)->get();

        $monthlyTrend = collect(range(1, 12))
            ->map(function (int $month) use ($attendance, $resolvedYear) {
                $records = $attendance->filter(fn (Attendance $record) => (int) $record->date?->year === $resolvedYear && (int) $record->date?->month === $month);

                return [
                    'month' => Carbon::create($resolvedYear, $month, 1)->format('M'),
                    'percentage' => $this->attendancePercentage($records),
                    'total_records' => $records->count(),
                ];
            })
            ->values();

        $bySubject = $attendance
            ->groupBy(fn (Attendance $record) => (string) ($record->subject?->id ?? 'unknown'))
            ->map(function (Collection $records) {
                /** @var Attendance $first */
                $first = $records->first();

                return [
                    'subject_id' => $first?->subject?->id,
                    'subject' => $first?->subject?->name ?? 'Unknown Subject',
                    'percentage' => $this->attendancePercentage($records),
                    'total_records' => $records->count(),
                ];
            })
            ->sortByDesc('percentage')
            ->values();

        $lowAttendance = $attendance
            ->groupBy('student_id')
            ->map(function (Collection $records) {
                /** @var Attendance $first */
                $first = $records->first();
                $percentage = $this->attendancePercentage($records);

                return [
                    'student_id' => $first?->student?->id,
                    'student_name' => $first?->student?->full_name ?? 'Unknown Student',
                    'student_code' => $first?->student?->student_id ?? 'N/A',
                    'department' => $first?->student?->department ?? 'unknown',
                    'percentage' => $percentage,
                    'total_records' => $records->count(),
                ];
            })
            ->filter(fn (array $student) => $student['percentage'] < 75)
            ->sortBy('percentage')
            ->take(5)
            ->values();

        return response()->json([
            'filters' => $this->filterPayload($resolvedYear, $department),
            'summary' => [
                'overall_percentage' => $this->attendancePercentage($attendance),
                'total_records' => $attendance->count(),
            ],
            'monthly_trend' => $monthlyTrend,
            'by_subject' => $bySubject,
            'low_attendance' => $lowAttendance,
        ]);
    }

    public function academicStats(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $year = $filters['year'] ?? null;
        $department = $filters['department'] ?? null;
        $resolvedYear = $year ?? now()->year;

        $records = $this->shareeaAnalyticsQuery($resolvedYear, $department)->get();

        $gradeDistribution = collect(self::GRADE_ORDER)
            ->map(fn (string $grade) => [
                'grade' => $grade,
                'count' => $records->filter(fn (ShareeaRecord $record) => $this->normalizeGrade((string) $record->grade) === $grade)->count(),
            ])
            ->values();

        $semesterGpa = $records
            ->groupBy(fn (ShareeaRecord $record) => $record->academic_level ?: 'General')
            ->map(function (Collection $items, string $semester) {
                return [
                    'semester' => $semester,
                    'average_gpa' => round((float) $items->avg(fn (ShareeaRecord $record) => $this->gradeToGpa($this->normalizeGrade((string) $record->grade))), 2),
                ];
            })
            ->sortBy('semester', SORT_NATURAL)
            ->values();

        $topStudents = $records
            ->groupBy('student_id')
            ->map(function (Collection $items) {
                /** @var ShareeaRecord $first */
                $first = $items->first();
                $student = $first?->student;

                return [
                    'student_id' => $student?->id,
                    'student_code' => $student?->student_id ?? 'N/A',
                    'full_name' => $student?->full_name ?? 'Unknown Student',
                    'department' => $student?->department ?? 'unknown',
                    'average_gpa' => round((float) $items->avg(fn (ShareeaRecord $record) => $this->gradeToGpa($this->normalizeGrade((string) $record->grade))), 2),
                    'average_marks' => round((float) $items->avg(fn (ShareeaRecord $record) => (float) ($record->marks ?? 0)), 2),
                    'record_count' => $items->count(),
                ];
            })
            ->sortByDesc('average_gpa')
            ->take(5)
            ->values();

        return response()->json([
            'filters' => $this->filterPayload($resolvedYear, $department),
            'summary' => [
                'average_gpa' => round((float) $records->avg(fn (ShareeaRecord $record) => $this->gradeToGpa($this->normalizeGrade((string) $record->grade))), 2),
                'total_records' => $records->count(),
            ],
            'grade_distribution' => $gradeDistribution,
            'semester_gpa' => $semesterGpa,
            'top_students' => $topStudents,
        ]);
    }

    public function hiflStats(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $year = $filters['year'] ?? null;
        $department = $filters['department'] ?? null;
        $resolvedYear = $year ?? now()->year;

        $progressRecords = $this->hiflAnalyticsQuery($resolvedYear, $department)->get();

        $latestByStudent = $progressRecords
            ->sortByDesc(fn (HiflProgress $record) => $record->recorded_on?->timestamp ?? 0)
            ->groupBy('student_id')
            ->map(fn (Collection $items) => $items->first())
            ->values();

        $progressBuckets = collect([
            ['label' => '0-25%', 'min' => 0, 'max' => 25],
            ['label' => '26-50%', 'min' => 26, 'max' => 50],
            ['label' => '51-75%', 'min' => 51, 'max' => 75],
            ['label' => '76-100%', 'min' => 76, 'max' => 100],
        ])->map(function (array $bucket) use ($latestByStudent) {
            return [
                'label' => $bucket['label'],
                'count' => $latestByStudent->filter(function (HiflProgress $record) use ($bucket) {
                    $completion = (float) $record->completion_percentage;

                    return $completion >= $bucket['min'] && $completion <= $bucket['max'];
                })->count(),
            ];
        })->values();

        return response()->json([
            'filters' => $this->filterPayload($resolvedYear, $department),
            'tracked_students' => $latestByStudent->count(),
            'average_completion_percentage' => round((float) $latestByStudent->avg(fn (HiflProgress $record) => (float) $record->completion_percentage), 2),
            'progress_buckets' => $progressBuckets,
            'milestones' => [
                'quarter' => $latestByStudent->filter(fn (HiflProgress $record) => (float) $record->completion_percentage >= 25)->count(),
                'halfway' => $latestByStudent->filter(fn (HiflProgress $record) => (float) $record->completion_percentage >= 50)->count(),
                'advanced' => $latestByStudent->filter(fn (HiflProgress $record) => (float) $record->completion_percentage >= 75)->count(),
                'complete' => $latestByStudent->filter(fn (HiflProgress $record) => (float) $record->completion_percentage >= 100)->count(),
            ],
        ]);
    }

    public function emailStats(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $year = $filters['year'] ?? null;
        $department = $filters['department'] ?? null;

        $logs = $this->emailAnalyticsQuery($year, $department)->get();

        $byTemplate = $logs
            ->groupBy(fn (EmailLog $log) => $log->template_used ?: 'Direct Email')
            ->map(fn (Collection $items, string $template) => [
                'template' => $template,
                'count' => $items->count(),
            ])
            ->sortByDesc('count')
            ->values();

        return response()->json([
            'filters' => $this->filterPayload($year, $department),
            'totals' => [
                'sent' => $logs->where('status', 'sent')->count(),
                'failed' => $logs->where('status', 'failed')->count(),
                'pending' => $logs->where('status', 'pending')->count(),
                'total' => $logs->count(),
            ],
            'by_template' => $byTemplate,
        ]);
    }

    public function monthlyTrends(Request $request)
    {
        $filters = $this->validatedFilters($request);
        $year = $filters['year'] ?? null;
        $department = $filters['department'] ?? null;

        $students = $this->studentAnalyticsQuery(null, $department, false)->get(['id', 'department', 'batch', 'enrollment_date', 'created_at']);
        $applications = $this->applicationAnalyticsQuery(null, $department, false)->get(['id', 'department', 'submitted_at', 'created_at']);

        if ($year) {
            $labels = collect(range(1, 12))
                ->map(fn (int $month) => Carbon::create($year, $month, 1)->format('M'))
                ->values();

            $enrollments = collect(range(1, 12))
                ->map(fn (int $month) => $students->filter(function (Student $student) use ($year, $month) {
                    $date = $student->enrollment_date ?: $student->created_at;

                    return $date && (int) $date->year === $year && (int) $date->month === $month;
                })->count())
                ->values();

            $applicationCounts = collect(range(1, 12))
                ->map(fn (int $month) => $applications->filter(function (Application $application) use ($year, $month) {
                    $date = $application->submitted_at ?: $application->created_at;

                    return $date && (int) $date->year === $year && (int) $date->month === $month;
                })->count())
                ->values();
        } else {
            $start = now()->copy()->startOfMonth()->subMonths(11);
            $period = collect(range(0, 11))
                ->map(fn (int $offset) => $start->copy()->addMonths($offset));

            $labels = $period->map(fn (Carbon $date) => $date->format('M y'))->values();

            $enrollments = $period
                ->map(fn (Carbon $periodDate) => $students->filter(function (Student $student) use ($periodDate) {
                    $date = $student->enrollment_date ?: $student->created_at;

                    return $date && $date->format('Y-m') === $periodDate->format('Y-m');
                })->count())
                ->values();

            $applicationCounts = $period
                ->map(fn (Carbon $periodDate) => $applications->filter(function (Application $application) use ($periodDate) {
                    $date = $application->submitted_at ?: $application->created_at;

                    return $date && $date->format('Y-m') === $periodDate->format('Y-m');
                })->count())
                ->values();
        }

        return response()->json([
            'filters' => $this->filterPayload($year, $department),
            'labels' => $labels,
            'enrollments' => $enrollments,
            'applications' => $applicationCounts,
        ]);
    }

    private function validatedFilters(Request $request): array
    {
        return $request->validate([
            'year' => ['nullable', 'integer', 'min:2000', 'max:' . (now()->year + 5)],
            'department' => ['nullable', 'in:shareea,hifl'],
        ]);
    }

    private function filterPayload(?int $year, ?string $department): array
    {
        return [
            'year' => $year,
            'department' => $department,
        ];
    }

    private function studentAnalyticsQuery(?int $year, ?string $department, bool $applyYear = true): Builder
    {
        return Student::query()
            ->with(['application:id,application_no,department,status'])
            ->when($department, fn (Builder $query, string $departmentName) => $query->where('department', $departmentName))
            ->when($applyYear && $year, function (Builder $query) use ($year) {
                $query->where(function (Builder $inner) use ($year) {
                    $inner->where('batch', (string) $year)
                        ->orWhereYear('enrollment_date', $year);
                });
            });
    }

    private function teacherAnalyticsQuery(?int $year, ?string $department, bool $applyYear = true): Builder
    {
        return Teacher::query()
            ->with(['subjects:id,name,department'])
            ->when($department, function (Builder $query, string $departmentName) {
                $query->whereIn('department', [$departmentName, 'both']);
            })
            ->when($applyYear && $year, fn (Builder $query) => $query->whereYear('joining_date', $year));
    }

    private function applicationAnalyticsQuery(?int $year, ?string $department, bool $applyYear = true): Builder
    {
        return Application::query()
            ->with([
                'applicant:id,name,email,role_id',
                'applicant.role:id,name,slug',
                'reviewer:id,name,email,role_id',
                'reviewer.role:id,name,slug',
            ])
            ->when($department, fn (Builder $query, string $departmentName) => $query->where('department', $departmentName))
            ->when($applyYear && $year, fn (Builder $query) => $query->whereYear('created_at', $year));
    }

    private function attendanceAnalyticsQuery(?int $year, ?string $department, bool $applyYear = true): Builder
    {
        return Attendance::query()
            ->with([
                'subject:id,name,department',
                'student:id,student_id,full_name,department',
                'teacher:id,full_name',
            ])
            ->when($department, function (Builder $query, string $departmentName) {
                $query->whereHas('student', fn (Builder $studentQuery) => $studentQuery->where('department', $departmentName));
            })
            ->when($applyYear && $year, fn (Builder $query) => $query->whereYear('date', $year));
    }

    private function shareeaAnalyticsQuery(?int $year, ?string $department, bool $applyYear = true): Builder
    {
        return ShareeaRecord::query()
            ->with([
                'student:id,student_id,full_name,department',
                'teacher:id,full_name',
            ])
            ->when($department, function (Builder $query, string $departmentName) {
                $query->whereHas('student', fn (Builder $studentQuery) => $studentQuery->where('department', $departmentName));
            })
            ->when($applyYear && $year, fn (Builder $query) => $query->whereYear('exam_date', $year));
    }

    private function hiflAnalyticsQuery(?int $year, ?string $department, bool $applyYear = true): Builder
    {
        return HiflProgress::query()
            ->with([
                'student:id,student_id,full_name,department',
                'teacher:id,full_name',
            ])
            ->when($department, function (Builder $query, string $departmentName) {
                $query->whereHas('student', fn (Builder $studentQuery) => $studentQuery->where('department', $departmentName));
            })
            ->when($applyYear && $year, fn (Builder $query) => $query->whereYear('recorded_on', $year));
    }

    private function announcementAnalyticsQuery(?string $department): Builder
    {
        return Announcement::query()
            ->with(['creator:id,name,email,role_id', 'creator.role:id,name,slug'])
            ->when($department, function (Builder $query, string $departmentName) {
                $query->where(function (Builder $inner) use ($departmentName) {
                    $inner->whereNull('department')->orWhere('department', $departmentName);
                });
            });
    }

    private function emailAnalyticsQuery(?int $year, ?string $department, bool $applyYear = true): Builder
    {
        $departmentEmails = $department ? $this->departmentRecipientEmails($department) : collect();

        return EmailLog::query()
            ->with(['sender:id,name,email,role_id', 'sender.role:id,name,slug'])
            ->when($applyYear && $year, function (Builder $query) use ($year) {
                $query->where(function (Builder $inner) use ($year) {
                    $inner->whereYear('created_at', $year)
                        ->orWhereYear('sent_at', $year);
                });
            })
            ->when($department, function (Builder $query) use ($departmentEmails) {
                $query->whereIn('recipient_email', $departmentEmails->isNotEmpty() ? $departmentEmails->all() : ['__no_match__']);
            });
    }

    private function departmentRecipientEmails(string $department): Collection
    {
        $studentEmails = Student::query()
            ->where('department', $department)
            ->whereNotNull('email')
            ->pluck('email');

        $teacherEmails = Teacher::query()
            ->whereIn('department', [$department, 'both'])
            ->whereNotNull('email')
            ->pluck('email');

        return $studentEmails
            ->merge($teacherEmails)
            ->map(fn (string $email) => strtolower($email))
            ->unique()
            ->values();
    }

    private function attendancePercentage(Collection $records): float
    {
        $total = $records->count();

        if ($total === 0) {
            return 0.0;
        }

        $attended = $records
            ->filter(fn ($record) => in_array($record->status, self::ATTENDED_STATUSES, true))
            ->count();

        return round(($attended / $total) * 100, 2);
    }

    private function normalizeGrade(string $grade): string
    {
        $normalized = strtoupper(trim($grade));

        return match (true) {
            $normalized === 'A+' => 'A+',
            str_starts_with($normalized, 'A') => 'A',
            str_starts_with($normalized, 'B+') => 'B+',
            str_starts_with($normalized, 'B') => 'B',
            str_starts_with($normalized, 'C') => 'C',
            str_starts_with($normalized, 'D') => 'D',
            default => 'F',
        };
    }

    private function gradeToGpa(string $grade): float
    {
        return self::GPA_MAP[$grade] ?? 0.0;
    }
}
