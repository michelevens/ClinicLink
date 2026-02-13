<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f0f9ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
                    <!-- Top accent bar -->
                    <tr>
                        <td style="height:6px;background:linear-gradient(90deg,#0ea5e9,#8b5cf6,#ec4899);border-radius:12px 12px 0 0;"></td>
                    </tr>
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                                <!-- Header -->
                                <tr>
                                    <td style="background:linear-gradient(135deg,#064e3b 0%,#047857 50%,#10b981 100%);padding:40px 48px;text-align:center;">
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#ffffff;font-weight:bold;">+</td>
                                                <td style="padding-left:12px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">ClinicLink</td>
                                            </tr>
                                        </table>
                                        <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Continuing Education</p>
                                    </td>
                                </tr>

                                <!-- Icon -->
                                <tr>
                                    <td style="text-align:center;padding:32px 48px 0;">
                                        <div style="display:inline-block;width:80px;height:80px;background:linear-gradient(135deg,#d1fae5,#a7f3d0);border-radius:50%;line-height:80px;font-size:40px;">&#127891;</div>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:24px 48px 40px;">
                                        <h1 style="margin:0 0 8px;color:#0c4a6e;font-size:26px;font-weight:800;text-align:center;">CE Certificate Issued!</h1>
                                        <p style="margin:0 0 28px;color:#64748b;font-size:15px;text-align:center;line-height:1.5;">
                                            Congratulations, {{ $preceptorName }}! You've earned continuing education credit for your clinical preceptorship.
                                        </p>

                                        <!-- CE Details Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:2px solid #6ee7b7;border-radius:16px;overflow:hidden;margin-bottom:24px;">
                                            <tr>
                                                <td style="padding:28px;">
                                                    <!-- Contact Hours Highlight -->
                                                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                                                        <tr>
                                                            <td style="text-align:center;">
                                                                <p style="margin:0 0 4px;font-size:11px;color:#047857;text-transform:uppercase;letter-spacing:1.5px;font-weight:700;">Contact Hours Awarded</p>
                                                                <p style="margin:0;font-size:36px;font-weight:900;color:#065f46;">{{ $contactHours }}</p>
                                                            </td>
                                                        </tr>
                                                    </table>

                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td width="50%" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#6ee7b7;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Student</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ $studentName }}</p>
                                                            </td>
                                                            <td width="50%" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#6ee7b7;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Clinical Site</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ $siteName }}</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#6ee7b7;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Specialty</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ $specialty }}</p>
                                                            </td>
                                                            <td width="50%" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#6ee7b7;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Institution</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ $universityName }}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- CTA -->
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto 24px;">
                                            <tr>
                                                <td style="background:linear-gradient(135deg,#047857,#10b981);border-radius:12px;box-shadow:0 4px 12px rgba(16,185,129,0.3);">
                                                    <a href="{{ $dashboardUrl }}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                                                        View &amp; Download Certificate
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.5;">
                                            You can download a printable PDF version from your CE Credits page. Your certificate includes a QR code for instant verification.
                                        </p>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td style="padding:24px 48px;background-color:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
                                        <p style="margin:0 0 4px;font-size:13px;font-weight:600;color:#64748b;">ClinicLink</p>
                                        <p style="margin:0;color:#94a3b8;font-size:12px;">The modern platform for clinical rotation management</p>
                                        <p style="margin:12px 0 0;color:#cbd5e1;font-size:11px;">&copy; {{ date('Y') }} ClinicLink. All rights reserved.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
