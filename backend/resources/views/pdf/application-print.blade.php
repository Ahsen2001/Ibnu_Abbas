<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Application Print</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #172126;
            margin: 0;
            padding: 0;
            font-size: 13px;
        }
        .watermark {
            position: fixed;
            top: 42%;
            left: 8%;
            width: 84%;
            text-align: center;
            font-size: 44px;
            color: rgba(15, 118, 110, 0.07);
            transform: rotate(-28deg);
            z-index: -1;
        }
        .page {
            padding: 34px 40px 70px;
        }
        .header {
            border-bottom: 3px solid #0f766e;
            margin-bottom: 24px;
            padding-bottom: 14px;
        }
        .brand {
            font-size: 26px;
            color: #0f766e;
            margin: 0;
        }
        .sub {
            color: #475569;
            margin: 6px 0 0;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }
        th, td {
            border: 1px solid #dbe4e6;
            padding: 8px 10px;
            text-align: left;
            vertical-align: top;
        }
        th {
            background: #f1f5f9;
            width: 28%;
            color: #334155;
        }
        .section-title {
            margin: 22px 0 10px;
            font-size: 15px;
            color: #0f766e;
        }
        .footer {
            position: fixed;
            bottom: 16px;
            left: 40px;
            right: 40px;
            font-size: 11px;
            color: #64748b;
            border-top: 1px solid #dbe4e6;
            padding-top: 8px;
        }
    </style>
</head>
<body>
    <div class="watermark">IBNU ABBAS ARABIC COLLEGE</div>
    <div class="page">
        <div class="header">
            <h1 class="brand">IBNU ABBAS ARABIC COLLEGE</h1>
            <p class="sub">Admission Application Print Copy</p>
        </div>

        <h2 class="section-title">Application Summary</h2>
        <table>
            <tr><th>Reference Number</th><td>{{ $application->application_no }}</td></tr>
            <tr><th>Status</th><td>{{ strtoupper(str_replace('_', ' ', $application->status)) }}</td></tr>
            <tr><th>Department</th><td>{{ strtoupper($application->department) }}</td></tr>
            <tr><th>Submitted At</th><td>{{ optional($application->submitted_at)->format('F d, Y h:i A') ?? 'Not submitted' }}</td></tr>
            <tr><th>Submission Deadline</th><td>{{ optional($application->submission_deadline)->format('F d, Y h:i A') ?? 'Not set' }}</td></tr>
        </table>

        <h2 class="section-title">Personal Information</h2>
        <table>
            <tr><th>Applicant Name</th><td>{{ $application->applicant_name }}</td></tr>
            <tr><th>Date of Birth</th><td>{{ optional($application->date_of_birth)->format('F d, Y') }}</td></tr>
            <tr><th>Gender</th><td>{{ ucfirst($application->gender) }}</td></tr>
            <tr><th>Nationality</th><td>{{ $application->nationality }}</td></tr>
            <tr><th>Religion</th><td>{{ $application->religion }}</td></tr>
        </table>

        <h2 class="section-title">Contact Details</h2>
        <table>
            <tr><th>Email</th><td>{{ $application->email }}</td></tr>
            <tr><th>Phone</th><td>{{ $application->phone }}</td></tr>
            <tr><th>Address</th><td>{{ $application->address }}</td></tr>
            <tr><th>Guardian Name</th><td>{{ $application->guardian_name }}</td></tr>
            <tr><th>Guardian Phone</th><td>{{ $application->guardian_phone }}</td></tr>
        </table>

        <h2 class="section-title">Academic Background</h2>
        <table>
            <tr><th>Previous School</th><td>{{ $application->previous_school }}</td></tr>
            <tr><th>Previous Grade</th><td>{{ $application->previous_grade }}</td></tr>
        </table>

        <h2 class="section-title">Interview and Review</h2>
        <table>
            <tr><th>Interview Date</th><td>{{ optional($application->interview_date)->format('F d, Y') ?? 'Not scheduled' }}</td></tr>
            <tr><th>Interview Time</th><td>{{ $application->interview_time ?? 'Not scheduled' }}</td></tr>
            <tr><th>Interview Notes</th><td>{{ $application->interview_notes ?? 'N/A' }}</td></tr>
            <tr><th>Reviewed By</th><td>{{ $application->reviewer?->name ?? 'N/A' }}</td></tr>
        </table>
    </div>

    <div class="footer">
        Generated on {{ $generatedAt->format('F d, Y h:i A') }} | Reference {{ $application->application_no }}
    </div>
</body>
</html>
