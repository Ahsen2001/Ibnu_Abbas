<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Student ID Card</title>
    <style>
        @page {
            margin: 8px;
        }

        body {
            margin: 0;
            font-family: DejaVu Sans, sans-serif;
            color: #163038;
        }

        .sheet {
            width: 100%;
        }

        .watermark {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-20deg);
            font-size: 18px;
            color: rgba(16, 97, 90, 0.08);
            letter-spacing: 3px;
            white-space: nowrap;
            z-index: 0;
        }

        .cards {
            position: relative;
            z-index: 1;
            width: 100%;
            overflow: hidden;
        }

        .card {
            float: left;
            width: 242px;
            height: 153px;
            margin-right: 12px;
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #c9d8d5;
            background: linear-gradient(135deg, #ffffff 0%, #f4faf8 100%);
            box-sizing: border-box;
        }

        .card:last-child {
            margin-right: 0;
        }

        .header {
            background: #10615a;
            color: #ffffff;
            padding: 10px 12px;
        }

        .header h1 {
            margin: 0;
            font-size: 11px;
            letter-spacing: 0.7px;
        }

        .header p {
            margin: 4px 0 0;
            font-size: 8px;
        }

        .logo-placeholder {
            float: right;
            width: 34px;
            height: 34px;
            border-radius: 50%;
            border: 1px dashed rgba(255, 255, 255, 0.7);
            text-align: center;
            line-height: 34px;
            font-size: 7px;
        }

        .body {
            padding: 10px 12px;
        }

        .photo {
            float: left;
            width: 54px;
            height: 66px;
            border-radius: 8px;
            border: 1px solid #cbd5e1;
            background: #e2e8f0;
            text-align: center;
            line-height: 66px;
            font-size: 8px;
            color: #475569;
            overflow: hidden;
        }

        .photo img {
            width: 54px;
            height: 66px;
            object-fit: cover;
        }

        .details {
            margin-left: 66px;
        }

        .student-name {
            margin: 0 0 6px;
            font-size: 14px;
            font-weight: bold;
        }

        .row {
            margin-bottom: 5px;
            font-size: 8px;
        }

        .label {
            display: inline-block;
            width: 64px;
            color: #475569;
            font-weight: bold;
        }

        .barcode {
            margin-top: 10px;
            border: 1px dashed #94a3b8;
            border-radius: 8px;
            padding: 8px;
            text-align: center;
            font-size: 8px;
            letter-spacing: 2px;
            color: #1f2937;
        }

        .back-content {
            padding: 12px;
            font-size: 8px;
            line-height: 1.5;
        }

        .back-content h2 {
            margin: 0 0 8px;
            font-size: 10px;
            color: #10615a;
        }

        .back-content ul {
            margin: 0;
            padding-left: 14px;
        }

        .footer {
            position: absolute;
            bottom: 10px;
            left: 12px;
            right: 12px;
            font-size: 7px;
            color: #64748b;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="sheet">
        <div class="watermark">IBNU ABBAS ARABIC COLLEGE</div>

        <div class="cards">
            <div class="card">
                <div class="header">
                    <div class="logo-placeholder">LOGO</div>
                    <h1>IBNU ABBAS ARABIC COLLEGE</h1>
                    <p>Official Student Identity Card</p>
                </div>

                <div class="body">
                    <div class="photo">
                        @if ($student->photo_path)
                            <img src="{{ public_path('storage/'.$student->photo_path) }}" alt="Student Photo">
                        @else
                            PHOTO
                        @endif
                    </div>

                    <div class="details">
                        <p class="student-name">{{ $student->full_name }}</p>
                        <div class="row"><span class="label">Student ID</span>{{ $student->student_id }}</div>
                        <div class="row"><span class="label">Department</span>{{ strtoupper($student->department) }}</div>
                        <div class="row"><span class="label">Batch</span>{{ $student->batch }}</div>
                        <div class="row"><span class="label">Status</span>{{ ucfirst($student->status) }}</div>
                    </div>

                    <div style="clear: both;"></div>

                    <div class="barcode">
                        ||| {{ $student->student_id }} |||
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="header">
                    <h1>Card Information</h1>
                    <p>Keep this card with you while on campus</p>
                </div>

                <div class="back-content">
                    <h2>Instructions</h2>
                    <ul>
                        <li>This card is the property of IBNU ABBAS ARABIC COLLEGE.</li>
                        <li>Produce this card on request by authorized staff.</li>
                        <li>If found, please return it to the college administration office.</li>
                    </ul>

                    <div style="margin-top: 10px;">
                        <strong>Guardian Contact:</strong> {{ $student->guardian_phone ?: 'Not available' }}<br>
                        <strong>Enrollment Date:</strong> {{ optional($student->enrollment_date)->format('d M Y') ?: 'Not available' }}
                    </div>
                </div>

                <div class="footer">
                    Generated {{ $generatedAt->format('d M Y') }} | Reference {{ $student->student_id }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
