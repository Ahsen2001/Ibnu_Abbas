@extends('pdf.layouts.college-document')

@section('content')
    <div class="centered" style="margin-top: 40px;">
        <p class="muted" style="font-size: 13px;">This is to certify that</p>
        <p style="font-size: 32px; font-weight: 700; color: #134e4a; margin: 18px 0 10px;">{{ $student->full_name }}</p>
        <p class="muted" style="font-size: 13px;">
            Student ID {{ $student->student_id }} | Department {{ strtoupper($student->department) }}
        </p>
        <div style="margin: 28px auto; width: 80%; border-top: 1px solid #cbd5e1;"></div>
        <p style="font-size: 16px; max-width: 80%; margin: 0 auto;">
            has successfully fulfilled the requirements for the
            <strong>{{ ucfirst($certificateType) }}</strong> recognition awarded by
            <strong>IBNU ABBAS ARABIC COLLEGE</strong>.
        </p>
        <p style="margin-top: 22px; font-size: 13px;">
            Issued on {{ ($generatedAt ?? now())->format('d M Y') }} in recognition of academic commitment and good standing.
        </p>
    </div>

    <table class="summary-table" style="margin-top: 48px;">
        <tr>
            <td class="label">Student Name</td>
            <td>{{ $student->full_name }}</td>
            <td class="label">Batch</td>
            <td>{{ $student->batch ?: 'Not recorded' }}</td>
        </tr>
        <tr>
            <td class="label">Department</td>
            <td>{{ strtoupper($student->department) }}</td>
            <td class="label">Status</td>
            <td>{{ ucfirst($student->status) }}</td>
        </tr>
    </table>
@endsection
