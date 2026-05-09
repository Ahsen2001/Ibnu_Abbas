@extends('pdf.layouts.college-document')

@section('content')
    <div class="section-title">Applicant Profile</div>
    <table class="summary-table">
        <tr>
            <td class="label">Applicant Name</td>
            <td>{{ $application->applicant_name }}</td>
            <td class="label">Application No</td>
            <td>{{ $application->application_no }}</td>
        </tr>
        <tr>
            <td class="label">Date of Birth</td>
            <td>{{ optional($application->date_of_birth)->format('d M Y') ?: 'Not recorded' }}</td>
            <td class="label">Gender</td>
            <td>{{ $application->gender ? ucfirst($application->gender) : 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Nationality</td>
            <td>{{ $application->nationality ?: 'Not recorded' }}</td>
            <td class="label">Religion</td>
            <td>{{ $application->religion ?: 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Department</td>
            <td>{{ strtoupper($application->department) }}</td>
            <td class="label">Status</td>
            <td><span class="pill">{{ str_replace('_', ' ', $application->status) }}</span></td>
        </tr>
    </table>

    <div class="section-title">Contact & Guardian Details</div>
    <table class="summary-table">
        <tr>
            <td class="label">Email</td>
            <td>{{ $application->email }}</td>
            <td class="label">Phone</td>
            <td>{{ $application->phone }}</td>
        </tr>
        <tr>
            <td class="label">Address</td>
            <td colspan="3">{{ $application->address }}</td>
        </tr>
        <tr>
            <td class="label">Guardian Name</td>
            <td>{{ $application->guardian_name }}</td>
            <td class="label">Guardian Phone</td>
            <td>{{ $application->guardian_phone }}</td>
        </tr>
    </table>

    <div class="section-title">Academic Background</div>
    <table class="summary-table">
        <tr>
            <td class="label">Previous School</td>
            <td>{{ $application->previous_school ?: 'Not recorded' }}</td>
            <td class="label">Previous Grade</td>
            <td>{{ $application->previous_grade ?: 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Submitted At</td>
            <td>{{ optional($application->submitted_at)->format('d M Y h:i A') ?: 'Draft' }}</td>
            <td class="label">Reviewer</td>
            <td>{{ $application->reviewer?->name ?: 'Not assigned' }}</td>
        </tr>
    </table>

    <div class="section-title">Uploaded Documents</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Stored File Path</th>
            </tr>
        </thead>
        <tbody>
            @forelse (($application->documents ?? []) as $index => $document)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $document }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="2">No documents were uploaded for this application.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
