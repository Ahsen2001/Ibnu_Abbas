<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IBNU ABBAS ARABIC COLLEGE</title>
</head>
<body style="margin:0; padding:0; background:#f5f7f6; font-family:Arial, Helvetica, sans-serif; color:#172126;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5f7f6; padding:24px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="680" cellspacing="0" cellpadding="0" style="max-width:680px; width:100%; background:#ffffff; border:1px solid #d9e4e1; border-radius:14px; overflow:hidden;">
                    <tr>
                        <td style="background:#0f766e; color:#ffffff; padding:24px 28px;">
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="vertical-align:middle;">
                                        <div style="display:inline-block; width:56px; height:56px; border-radius:50%; border:1px dashed rgba(255,255,255,0.7); text-align:center; line-height:56px; font-size:12px; font-weight:bold;">
                                            LOGO
                                        </div>
                                    </td>
                                    <td style="padding-left:16px; vertical-align:middle;">
                                        <div style="font-size:22px; font-weight:700; letter-spacing:0.3px;">IBNU ABBAS ARABIC COLLEGE</div>
                                        <div style="font-size:13px; margin-top:4px; color:#d1fae5;">Official College Communication</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:28px;">
                            @if ($recipientName)
                                <p style="margin:0 0 18px; font-size:15px; line-height:1.6;">Assalamu Alaikum {{ $recipientName }},</p>
                            @endif

                            <div style="font-size:15px; line-height:1.7; color:#334155;">
                                {!! $bodyHtml !!}
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:18px 28px; background:#f8fafc; border-top:1px solid #e2e8f0;">
                            <p style="margin:0; font-size:12px; line-height:1.7; color:#64748b;">
                                IBNU ABBAS ARABIC COLLEGE<br>
                                College Administration Office, Sri Lanka
                            </p>
                            <p style="margin:12px 0 0; font-size:11px; line-height:1.6; color:#94a3b8;">
                                You are receiving this email because you are connected to an IBNU ABBAS ARABIC COLLEGE account or communication list.
                                If this message reached you in error, please contact the college office.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
