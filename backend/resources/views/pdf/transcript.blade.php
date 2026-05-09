@extends('pdf.layouts.college-document')

@section('content')
    <div class="section-title">Student Summary</div>
    <table class="summary-table">
        <tr>
            <td class="label">Student Name</td>
            <td>{{ $student->full_name }}</td>
            <td class="label">Student ID</td>
            <td>{{ $student->student_id }}</td>
        </tr>
        <tr>
            <td class="label">Department</td>
            <td>{{ strtoupper($student->department) }}</td>
            <td class="label">Semester / Level</td>
            <td>{{ $semester ?: 'All Levels' }}</td>
        </tr>
    </table>

    <div class="section-title">Academic Record</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>Subject</th>
                <th>Code</th>
                <th>Academic Level</th>
                <th>Exam</th>
                <th>Marks</th>
                <th>Grade</th>
                <th>Result</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($records as $record)
                <tr>
                    <td>{{ $record->subject_name }}</td>
                    <td>{{ $record->subject_code ?: '-' }}</td>
                    <td>{{ $record->academic_level ?: '-' }}</td>
                    <td>{{ $record->exam_name ?: '-' }}</td>
                    <td>{{ $record->marks !== null ? number_format((float) $record->marks, 2) : '-' }}</td>
                    <td>{{ $record->grade ?: '-' }}</td>
                    <td>{{ ucfirst($record->result_status) }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">No Shareea records were found for this student and semester selection.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="section-title">Performance Summary</div>
    <table class="summary-table">
        <tr>
            <td class="label">Average Marks</td>
            <td>{{ $averageMarks !== null ? number_format((float) $averageMarks, 2) : 'Not available' }}</td>
            <td class="label">Average GPA</td>
            <td>{{ $gpa !== null ? number_format((float) $gpa, 2) : 'Not available' }}</td>
        </tr>
    </table>
@endsection
