@php
    $logoPath = public_path('logo.jpeg');
    $logoData = file_exists($logoPath)
        ? 'data:image/jpeg;base64,'.base64_encode(file_get_contents($logoPath))
        : null;

    $photoData = null;

    if ($student->photo_path) {
        $photoPath = public_path('storage/'.$student->photo_path);

        if (file_exists($photoPath)) {
            $photoMime = mime_content_type($photoPath) ?: 'image/jpeg';
            $photoData = 'data:'.$photoMime.';base64,'.base64_encode(file_get_contents($photoPath));
        }
    }

    $enrollmentAt = $student->enrollment_date?->copy();

    if (! $enrollmentAt && $student->created_at) {
        $enrollmentAt = $student->created_at->copy();
    } elseif (
        $enrollmentAt
        && $enrollmentAt->format('H:i:s') === '00:00:00'
        && $student->created_at
    ) {
        $enrollmentAt->setTimeFrom($student->created_at);
    }
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Student ID Card</title>
    <style>
        @page { margin: 8px; }
        body {
            margin: 0;
            font-family: DejaVu Sans, sans-serif;
            color: #163038;
            font-size: 10px;
        }
        .sheet {
            position: relative;
            width: 100%;
        }
        .watermark {
            position: absolute;
            top: 62px;
            left: 118px;
            transform: rotate(-18deg);
            font-size: 18px;
            color: rgba(16, 97, 90, 0.08);
            letter-spacing: 3px;
            z-index: 0;
            white-space: nowrap;
        }
        .card {
            position: relative;
            z-index: 1;
            display: inline-block;
            vertical-align: top;
            width: 242px;
            height: 153px;
            border: 1px solid #c9d8d5;
            border-radius: 14px;
            overflow: hidden;
            box-sizing: border-box;
        }
        .card + .card {
            margin-left: 12px;
        }
        .front-card {
            background: #1a746d;
            color: #ffffff;
        }
        .back-card {
            background: #ffffff;
        }
        .front-header {
            padding: 12px 14px 0;
        }
        .front-header table,
        .front-body table {
            width: 100%;
            border-collapse: collapse;
        }
        .brand-title {
            font-size: 10px;
            letter-spacing: 2.2px;
        }
        .brand-subtitle {
            margin-top: 5px;
            font-size: 8px;
            color: #d9f5f0;
        }
        .logo-shell {
            width: 38px;
            height: 38px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.35);
            background: rgba(255, 255, 255, 0.08);
            text-align: center;
            vertical-align: middle;
        }
        .logo-shell img {
            width: 30px;
            height: 30px;
            margin-top: 3px;
            border-radius: 50%;
            object-fit: cover;
        }
        .front-body {
            padding: 12px 14px 10px;
        }
        .photo-shell {
            width: 62px;
            height: 74px;
            border-radius: 10px;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.18);
            text-align: center;
            line-height: 74px;
            color: #d9f5f0;
            font-size: 8px;
        }
        .photo-shell img {
            width: 62px;
            height: 74px;
            object-fit: cover;
        }
        .student-name {
            margin: 0 0 8px;
            font-size: 12px;
            font-weight: bold;
        }
        .detail-line {
            margin: 0 0 4px;
            font-size: 8px;
        }
        .barcode {
            margin: 12px 14px 0;
            padding: 8px 0;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.10);
            text-align: center;
            font-size: 8px;
            letter-spacing: 4px;
        }
        .back-header {
            padding: 12px 14px 8px;
            background: #0f5f58;
            color: #ffffff;
        }
        .back-header h2 {
            margin: 0;
            font-size: 10px;
        }
        .back-header p {
            margin: 4px 0 0;
            font-size: 8px;
            color: #d6f4ef;
        }
        .back-content {
            padding: 10px 14px;
            font-size: 8px;
            line-height: 1.55;
        }
        .meta-row {
            margin-bottom: 6px;
        }
        .meta-label {
            font-weight: bold;
            color: #0f172a;
        }
        .rules {
            margin: 8px 0 0 13px;
            padding: 0;
        }
        .rules li {
            margin-bottom: 4px;
        }
        .footer {
            position: absolute;
            bottom: 8px;
            left: 14px;
            right: 14px;
            font-size: 7px;
            text-align: center;
            color: #64748b;
        }
    </style>
</head>
<body>
    <div class="sheet">
        <div class="watermark">IBNU ABBAS ARABIC COLLEGE</div>

        <div class="card front-card">
            <div class="front-header">
                <table>
                    <tr>
                        <td>
                            <div class="brand-title">IBNU ABBAS ARABIC COLLEGE</div>
                            <div class="brand-subtitle">Official Student Identity Card</div>
                        </td>
                        <td align="right" width="48">
                            <div class="logo-shell">
                                @if ($logoData)
                                    <img src="{{ $logoData }}" alt="College Logo">
                                @endif
                            </div>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="front-body">
                <table>
                    <tr>
                        <td width="74" valign="top">
                            <div class="photo-shell">
                                @if ($photoData)
                                    <img src="{{ $photoData }}" alt="Student Photo">
                                @else
                                    PHOTO
                                @endif
                            </div>
                        </td>
                        <td valign="top">
                            <p class="student-name">{{ $student->full_name }}</p>
                            <p class="detail-line">ID: {{ $student->student_id }}</p>
                            <p class="detail-line">Department: {{ strtoupper($student->department) }}</p>
                            <p class="detail-line">Batch: {{ $student->batch ?: 'N/A' }}</p>
                            <p class="detail-line">Status: {{ ucfirst($student->status) }}</p>
                        </td>
                    </tr>
                </table>
            </div>

            <div class="barcode">||| {{ $student->student_id }} |||</div>
        </div>

        <div class="card back-card">
            <div class="back-header">
                <h2>Card Information</h2>
                <p>Keep this card with you while on campus.</p>
            </div>

            <div class="back-content">
                <div class="meta-row"><span class="meta-label">Guardian Contact:</span> {{ $student->guardian_phone ?: 'Not available' }}</div>
                <div class="meta-row"><span class="meta-label">Enrollment Date:</span> {{ $enrollmentAt?->format('d M Y, h:i A') ?: 'Not available' }}</div>
                <div class="meta-row"><span class="meta-label">Reference:</span> {{ $student->student_id }}</div>

                <ul class="rules">
                    <li>This card is the property of IBNU ABBAS ARABIC COLLEGE.</li>
                    <li>Produce this card on request by authorized staff.</li>
                    <li>Report loss immediately to the administration office.</li>
                </ul>
            </div>

            <div class="footer">
                Generated {{ $generatedAt->format('d M Y, h:i A') }}
            </div>
        </div>
    </div>
</body>
</html>
