@extends('pdf.layouts.college-document')

@section('content')
    <div class="section-title">Filter Summary</div>
    <table class="summary-table">
        <tr>
            <td class="label">Department</td>
            <td>{{ ! empty($filters['department']) ? strtoupper($filters['department']) : 'All Departments' }}</td>
            <td class="label">Date Range</td>
            <td>
                {{ ! empty($filters['date_from']) ? \Illuminate\Support\Carbon::parse($filters['date_from'])->format('d M Y') : 'Start not set' }}
                -
                {{ ! empty($filters['date_to']) ? \Illuminate\Support\Carbon::parse($filters['date_to'])->format('d M Y') : 'End not set' }}
            </td>
        </tr>
    </table>

    <div class="section-title">Scheduled Candidates</div>
    <table class="data-table">
        <thead>
            <tr>
                <th>#</th>
                <th>Application No</th>
                <th>Applicant</th>
                <th>Department</th>
                <th>Interview Date</th>
                <th>Interview Time</th>
                <th>Notes</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($applications as $index => $application)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $application->application_no }}</td>
                    <td>{{ $application->applicant_name }}</td>
                    <td>{{ strtoupper($application->department) }}</td>
                    <td>{{ optional($application->interview_date)->format('d M Y') ?: 'Not scheduled' }}</td>
                    <td>{{ $application->interview_time ?: 'Not scheduled' }}</td>
                    <td>{{ $application->interview_notes ?: 'No notes' }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="7">No interview appointments matched the selected filters.</td>
                </tr>
            @endforelse
        </tbody>
    </table>
@endsection
