<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ $documentHeading ?? 'College Document' }}</title>
    <style>
        @page {
            margin: 110px 44px 120px 44px;
        }

        body {
            font-family: DejaVu Sans, sans-serif;
            color: #0f172a;
            font-size: 12px;
            line-height: 1.55;
        }

        .watermark {
            position: fixed;
            top: 38%;
            left: 10%;
            transform: rotate(-28deg);
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 0.3em;
            color: rgba(15, 118, 110, 0.08);
        }

        header {
            position: fixed;
            top: -86px;
            left: 0;
            right: 0;
            height: 78px;
            border-bottom: 2px solid #0f766e;
        }

        .header-table,
        .summary-table,
        .data-table,
        .footer-grid {
            width: 100%;
            border-collapse: collapse;
        }

        .logo-cell {
            width: 86px;
            vertical-align: top;
        }

        .logo {
            width: 68px;
            height: 68px;
            border-radius: 10px;
            border: 1px solid #99f6e4;
            background: #ffffff;
            text-align: center;
            line-height: 68px;
            overflow: hidden;
        }

        .logo img {
            width: 68px;
            height: 68px;
            object-fit: cover;
        }

        .college-title {
            font-size: 20px;
            font-weight: 700;
            color: #134e4a;
            margin: 0 0 4px;
        }

        .college-meta,
        .muted {
            color: #64748b;
            font-size: 11px;
        }

        .document-title {
            font-size: 22px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 4px;
        }

        .document-meta {
            margin-top: 6px;
            padding: 10px 14px;
            border-radius: 10px;
            background: #f0fdfa;
            color: #115e59;
            font-size: 11px;
        }

        .section-title {
            margin: 20px 0 8px;
            font-size: 15px;
            font-weight: 700;
            color: #134e4a;
        }

        .summary-table td {
            padding: 6px 8px;
            border: 1px solid #cbd5e1;
            vertical-align: top;
        }

        .summary-table .label {
            width: 28%;
            background: #f8fafc;
            font-weight: 700;
            color: #334155;
        }

        .data-table th,
        .data-table td {
            border: 1px solid #cbd5e1;
            padding: 8px 9px;
            text-align: left;
            vertical-align: top;
        }

        .data-table th {
            background: #f8fafc;
            font-size: 11px;
            font-weight: 700;
            color: #334155;
        }

        .pill {
            display: inline-block;
            padding: 4px 9px;
            border-radius: 999px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 0.04em;
            text-transform: uppercase;
            background: #dcfce7;
            color: #166534;
        }

        .content-card {
            border: 1px solid #dbeafe;
            border-radius: 12px;
            padding: 16px 18px;
            background: #ffffff;
        }

        footer {
            position: fixed;
            bottom: -92px;
            left: 0;
            right: 0;
            height: 88px;
            border-top: 2px solid #0f766e;
            padding-top: 10px;
        }

        .footer-grid td {
            width: 33.333%;
            vertical-align: bottom;
            font-size: 10px;
            color: #475569;
        }

        .signature-line {
            margin-top: 24px;
            border-top: 1px solid #94a3b8;
            padding-top: 5px;
            width: 85%;
        }

        .stamp-box {
            width: 86px;
            height: 50px;
            border: 1px dashed #94a3b8;
            text-align: center;
            line-height: 50px;
            font-size: 10px;
            color: #64748b;
            margin-left: auto;
        }

        .centered {
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="watermark">IBNU ABBAS ARABIC COLLEGE</div>

    <header>
        <table class="header-table">
            <tr>
                <td class="logo-cell">
                    <div class="logo">
                        @if (! empty($logoDataUri))
                            <img alt="College Logo" src="{{ $logoDataUri }}">
                        @else
                            LOGO
                        @endif
                    </div>
                </td>
                <td>
                    <p class="college-title">IBNU ABBAS ARABIC COLLEGE</p>
                    <p class="college-meta">{{ $collegeAddress ?? 'Main Road, Addalaichenai, Sri Lanka' }}</p>
                    <p class="college-meta">{{ $collegeContact ?? '+94 67 227 7654 | info@ibnuabbascollege.edu' }}</p>
                </td>
            </tr>
        </table>
    </header>

    <main>
        <h1 class="document-title">{{ $documentHeading ?? 'College Document' }}</h1>
        <div class="document-meta">
            Reference: {{ $documentReference ?? 'N/A' }} |
            Generated: {{ ($generatedAt ?? now())->format('d M Y h:i A') }}
        </div>

        @yield('content')
    </main>

    <footer>
        <table class="footer-grid">
            <tr>
                <td>
                    <div class="signature-line">Prepared By</div>
                </td>
                <td>
                    <div class="signature-line">Principal Signature</div>
                </td>
                <td>
                    <div class="stamp-box">Stamp</div>
                    <div style="margin-top: 6px; text-align: right;">Date: {{ ($generatedAt ?? now())->format('d M Y') }}</div>
                </td>
            </tr>
        </table>
    </footer>
</body>
</html>
