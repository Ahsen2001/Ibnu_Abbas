<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Attendance Report</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; color: #1f2937; font-size: 12px; }
        h1, h2 { margin: 0; }
        .header { margin-bottom: 16px; border-bottom: 2px solid #0f766e; padding-bottom: 10px; }
        .muted { color: #64748b; font-size: 11px; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
        th { background: #f1f5f9; }
        .watermark {
            position: fixed;
            top: 40%;
            left: 18%;
            transform: rotate(-24deg);
            font-size: 42px;
            color: rgba(15, 118, 110, 0.08);
        }
    </style>
</head>
<body>
    <div class="watermark">IBNU ABBAS ARABIC COLLEGE</div>
    <div class="header">
        <h1>IBNU ABBAS ARABIC COLLEGE</h1>
        <p class="muted">Attendance Report | Generated {{ $generatedAt->format('d M Y H:i') }}</p>
    </div>

    <h2>Summary</h2>
    <table>
        <thead>
            <tr>
                <th>Student</th>
                <th>Student ID</th>
                <th>Total Records</th>
                <th>Present</th>
                <th>Present %</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($summary as $row)
                <tr>
                    <td>{{ $row['student_name'] }}</td>
                    <td>{{ $row['student_code'] }}</td>
                    <td>{{ $row['total'] }}</td>
                    <td>{{ $row['present'] }}</td>
                    <td>{{ $row['percentage'] }}%</td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <h2 style="margin-top: 18px;">Detailed Records</h2>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Teacher</th>
                <th>Status</th>
                <th>Remarks</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($records as $record)
                <tr>
                    <td>{{ optional($record->date)->format('d M Y') }}</td>
                    <td>{{ $record->student?->full_name }}</td>
                    <td>{{ $record->subject?->name }}</td>
                    <td>{{ $record->teacher?->full_name }}</td>
                    <td>{{ ucfirst($record->status) }}</td>
                    <td>{{ $record->remarks }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>
</html>
