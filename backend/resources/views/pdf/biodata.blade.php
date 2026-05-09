@extends('pdf.layouts.college-document')

@section('content')
    <div class="section-title">Personal Information</div>
    <table class="summary-table">
        <tr>
            <td class="label">Full Name</td>
            <td>{{ $student->full_name }}</td>
            <td class="label">Student ID</td>
            <td>{{ $student->student_id }}</td>
        </tr>
        <tr>
            <td class="label">Date of Birth</td>
            <td>{{ optional($student->date_of_birth)->format('d M Y') ?: 'Not recorded' }}</td>
            <td class="label">Gender</td>
            <td>{{ $student->gender ? ucfirst($student->gender) : 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Nationality</td>
            <td>{{ $student->nationality ?: 'Not recorded' }}</td>
            <td class="label">Religion</td>
            <td>{{ $student->religion ?: 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Department</td>
            <td>{{ strtoupper($student->department) }}</td>
            <td class="label">Batch</td>
            <td>{{ $student->batch ?: 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Enrollment</td>
            <td colspan="3">{{ optional($student->enrollment_date)->format('d M Y h:i A') ?: 'Not recorded' }}</td>
        </tr>
    </table>

    <div class="section-title">Contact Information</div>
    <table class="summary-table">
        <tr>
            <td class="label">Email</td>
            <td>{{ $student->email ?: 'Not recorded' }}</td>
            <td class="label">Phone</td>
            <td>{{ $student->phone ?: 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Address</td>
            <td colspan="3">{{ $student->address ?: 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Guardian Name</td>
            <td>{{ $student->guardian_name ?: 'Not recorded' }}</td>
            <td class="label">Guardian Phone</td>
            <td>{{ $student->guardian_phone ?: 'Not recorded' }}</td>
        </tr>
    </table>

    <div class="section-title">Admission Reference</div>
    <table class="summary-table">
        <tr>
            <td class="label">Application Number</td>
            <td>{{ $student->application?->application_no ?: 'Not linked' }}</td>
            <td class="label">Application Status</td>
            <td>{{ $student->application?->status ?: 'Not linked' }}</td>
        </tr>
    </table>

    <div class="section-title">Documents on Record</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Stored Document Path</th>
            </tr>
        </thead>
        <tbody>
            @forelse (($student->documents ?? []) as $index => $document)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $document }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="2">No supporting documents were stored for this student profile.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
