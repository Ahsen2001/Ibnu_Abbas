<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\AttendanceReportRequest;
use App\Http\Requests\Attendance\BulkAttendanceRequest;
use App\Http\Requests\Attendance\MarkAttendanceRequest;
use App\Models\Attendance;
use App\Models\Student;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AttendanceController extends Controller
{
    public function markAttendance(MarkAttendanceRequest $request)
    {
        $attendance = Attendance::updateOrCreate(
            [
                'student_id' => $request->validated('student_id'),
                'subject_id' => $request->validated('subject_id'),
                'date' => $request->validated('date'),
            ],
            [
                'teacher_id' => $request->validated('teacher_id'),
                'marked_by' => $request->user()->id,
                'status' => $request->validated('status'),
                'remarks' => $request->validated('remarks'),
            ]
        );

        return response()->json($attendance->load(['student', 'subject', 'teacher', 'marker']));
    }

    public function bulk(BulkAttendanceRequest $request)
    {
        $payload = $request->validated();

        DB::transaction(function () use ($payload, $request) {
            foreach ($payload['records'] as $record) {
                Attendance::updateOrCreate(
                    [
                        'student_id' => $record['student_id'],
                        'subject_id' => $payload['subject_id'],
                        'date' => $payload['date'],
                    ],
                    [
                        'teacher_id' => $payload['teacher_id'],
                        'marked_by' => $request->user()->id,
                        'status' => $record['status'],
                        'remarks' => $record['remarks'] ?? null,
                    ]
                );
            }
        });

        $records = Attendance::with(['student', 'subject', 'teacher'])
            ->where('subject_id', $payload['subject_id'])
            ->where('teacher_id', $payload['teacher_id'])
            ->whereDate('date', $payload['date'])
            ->orderBy('student_id')
            ->get();

        return response()->json([
            'message' => 'Attendance saved successfully.',
            'records' => $records,
        ]);
    }

    public function getStudentAttendance(Request $request, Student $student)
    {
        $records = Attendance::with(['subject', 'teacher'])
            ->where('student_id', $student->id)
            ->when($request->query('date_from'), fn ($query, $dateFrom) => $query->whereDate('date', '>=', $dateFrom))
            ->when($request->query('date_to'), fn ($query, $dateTo) => $query->whereDate('date', '<=', $dateTo))
            ->orderByDesc('date')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json($records);
    }

    public function getSubjectAttendance(Request $request, int $subjectId)
    {
        $records = Attendance::with(['student', 'teacher'])
            ->where('subject_id', $subjectId)
            ->when($request->query('date_from'), fn ($query, $dateFrom) => $query->whereDate('date', '>=', $dateFrom))
            ->when($request->query('date_to'), fn ($query, $dateTo) => $query->whereDate('date', '<=', $dateTo))
            ->orderByDesc('date')
            ->paginate((int) $request->query('per_page', 20));

        return response()->json($records);
    }

    public function getAttendanceSummary(Request $request, Student $student)
    {
        $summary = Attendance::query()
            ->selectRaw('COUNT(*) as total_records')
            ->selectRaw("SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_count")
            ->selectRaw("SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late_count")
            ->selectRaw("SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent_count")
            ->selectRaw("SUM(CASE WHEN status = 'excused' THEN 1 ELSE 0 END) as excused_count")
            ->where('student_id', $student->id)
            ->when($request->query('date_from'), fn ($query, $dateFrom) => $query->whereDate('date', '>=', $dateFrom))
            ->when($request->query('date_to'), fn ($query, $dateTo) => $query->whereDate('date', '<=', $dateTo))
            ->first();

        $total = (int) ($summary->total_records ?? 0);
        $present = (int) ($summary->present_count ?? 0);
        $percentage = $total > 0 ? round(($present / $total) * 100, 2) : 0;

        return response()->json([
            'student' => $student,
            'total_records' => $total,
            'present_count' => $present,
            'late_count' => (int) ($summary->late_count ?? 0),
            'absent_count' => (int) ($summary->absent_count ?? 0),
            'excused_count' => (int) ($summary->excused_count ?? 0),
            'present_percentage' => $percentage,
        ]);
    }

    public function generateReport(AttendanceReportRequest $request)
    {
        $filters = $request->validated();

        $records = Attendance::with(['student', 'subject', 'teacher', 'marker'])
            ->when($filters['student_id'] ?? null, fn ($query, $studentId) => $query->where('student_id', $studentId))
            ->when($filters['subject_id'] ?? null, fn ($query, $subjectId) => $query->where('subject_id', $subjectId))
            ->when($filters['teacher_id'] ?? null, fn ($query, $teacherId) => $query->where('teacher_id', $teacherId))
            ->when($filters['date_from'] ?? null, fn ($query, $dateFrom) => $query->whereDate('date', '>=', $dateFrom))
            ->when($filters['date_to'] ?? null, fn ($query, $dateTo) => $query->whereDate('date', '<=', $dateTo))
            ->orderByDesc('date')
            ->get();

        $summary = $records
            ->groupBy('student_id')
            ->map(function ($studentRecords) {
                $student = $studentRecords->first()->student;
                $total = $studentRecords->count();
                $present = $studentRecords->where('status', 'present')->count();
                $percentage = $total > 0 ? round(($present / $total) * 100, 2) : 0;

                return [
                    'student_id' => $student->id,
                    'student_name' => $student->full_name,
                    'student_code' => $student->student_id,
                    'total' => $total,
                    'present' => $present,
                    'percentage' => $percentage,
                ];
            })
            ->values();

        if (($filters['export'] ?? null) === 'pdf') {
            $pdf = Pdf::loadView('pdf.attendance-report', [
                'records' => $records,
                'summary' => $summary,
                'filters' => $filters,
                'generatedAt' => now(),
            ]);

            return $pdf->download('attendance-report.pdf');
        }

        return response()->json([
            'filters' => $filters,
            'records' => $records,
            'summary' => $summary,
        ]);
    }
}
