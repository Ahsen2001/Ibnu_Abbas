<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Offer Letter</title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            color: #172126;
            margin: 0;
            padding: 0;
        }
        .watermark {
            position: fixed;
            top: 42%;
            left: 10%;
            width: 80%;
            text-align: center;
            font-size: 42px;
            color: rgba(15, 118, 110, 0.08);
            transform: rotate(-28deg);
            z-index: -1;
        }
        .page {
            padding: 40px 48px;
        }
        .header {
            border-bottom: 3px solid #0f766e;
            padding-bottom: 16px;
            margin-bottom: 28px;
        }
        .logo {
            width: 70px;
            height: 70px;
            border: 1px solid #cbd5e1;
            text-align: center;
            line-height: 70px;
            font-size: 12px;
            color: #64748b;
            float: right;
        }
        h1 {
            margin: 0;
            font-size: 28px;
            color: #0f766e;
        }
        h2 {
            margin: 6px 0 0;
            font-size: 16px;
            color: #334155;
            font-weight: normal;
        }
        .meta {
            margin: 22px 0;
            font-size: 13px;
            color: #475569;
        }
        .meta td {
            padding: 4px 10px 4px 0;
        }
        .content {
            font-size: 14px;
            line-height: 1.8;
        }
        .conditions {
            margin-top: 22px;
            padding-left: 18px;
        }
        .signature {
            margin-top: 56px;
        }
        .signature-line {
            width: 220px;
            border-top: 1px solid #1f2937;
            margin-top: 38px;
            padding-top: 8px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="watermark">IBNU ABBAS ARABIC COLLEGE</div>
    <div class="page">
        <div class="header">
            <div class="logo">LOGO</div>
            <h1>IBNU ABBAS ARABIC COLLEGE</h1>
            <h2>Official Offer Letter</h2>
        </div>

        <table class="meta">
            <tr>
                <td><strong>Application No:</strong></td>
                <td>{{ $application->application_no }}</td>
            </tr>
            <tr>
                <td><strong>Offer Date:</strong></td>
                <td>{{ optional($application->offer_issued_at ?? $generatedAt)->format('F d, Y') }}</td>
            </tr>
            <tr>
                <td><strong>Department:</strong></td>
                <td>{{ strtoupper($application->department) }}</td>
            </tr>
        </table>

        <div class="content">
            <p>Dear <strong>{{ $application->applicant_name }}</strong>,</p>

            <p>
                We are pleased to offer you provisional admission to <strong>IBNU ABBAS ARABIC COLLEGE</strong>
                in the <strong>{{ strtoupper($application->department) }}</strong> program.
            </p>

            <p>
                This offer is issued following review of your application and, where applicable,
                completion of the admission interview process.
            </p>

            <p><strong>Conditions of Offer</strong></p>
            <ol class="conditions">
                <li>All submitted documents must be genuine and verifiable.</li>
                <li>You must complete final registration within the time period stated by the college.</li>
                <li>The college reserves the right to withdraw this offer if required academic or conduct standards are not met.</li>
                <li>You must comply with all college regulations, attendance rules, and departmental requirements.</li>
            </ol>

            <p>
                Please retain this letter for your records and present it during the enrollment process.
            </p>
        </div>

        <div class="signature">
            <div class="signature-line">Principal Signature</div>
        </div>
    </div>
</body>
</html>
