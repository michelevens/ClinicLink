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
                                    <td style="background:linear-gradient(135deg,#0c4a6e 0%,#0369a1 50%,#0ea5e9 100%);padding:40px 48px;text-align:center;">
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#ffffff;font-weight:bold;">+</td>
                                                <td style="padding-left:12px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">ClinicLink</td>
                                            </tr>
                                        </table>
                                        <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Clinical Rotation Platform</p>
                                    </td>
                                </tr>

                                <!-- Celebration Icon -->
                                <tr>
                                    <td style="text-align:center;padding:36px 48px 0;">
                                        <div style="display:inline-block;width:80px;height:80px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:50%;line-height:80px;font-size:40px;">&#127942;</div>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:24px 48px 40px;">
                                        <h1 style="margin:0 0 8px;color:#0c4a6e;font-size:26px;font-weight:800;text-align:center;">Congratulations, {{ $studentName }}!</h1>
                                        <p style="margin:0 0 28px;color:#64748b;font-size:15px;text-align:center;line-height:1.5;">You have been awarded a Certificate of Clinical Rotation Completion.</p>

                                        <!-- Certificate Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:2px solid #bae6fd;border-radius:16px;overflow:hidden;">
                                            <tr>
                                                <td style="padding:28px;">
                                                    <h2 style="margin:0 0 4px;font-size:18px;font-weight:700;color:#0c4a6e;">{{ $certificate->title }}</h2>
                                                    <p style="margin:0 0 20px;font-size:13px;color:#64748b;">Certificate No. {{ $certificate->certificate_number }}</p>

                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td width="50%" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Clinical Site</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ $certificate->slot->site->name ?? 'N/A' }}</p>
                                                            </td>
                                                            <td width="50%" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Specialty</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ $certificate->slot->specialty ?? 'N/A' }}</p>
                                                            </td>
                                                        </tr>
                                                        <tr>
                                                            <td width="50%" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Total Hours</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ number_format($certificate->total_hours, 1) }}</p>
                                                            </td>
                                                            <td width="50%" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Issued By</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ $certificate->issuer->first_name ?? '' }} {{ $certificate->issuer->last_name ?? '' }}</p>
                                                            </td>
                                                        </tr>
                                                        @if($certificate->overall_score)
                                                        <tr>
                                                            <td colspan="2" style="padding:8px 0;vertical-align:top;">
                                                                <p style="margin:0;font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;">Evaluation Score</p>
                                                                <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#1e293b;">{{ number_format($certificate->overall_score, 1) }} / 5.0</p>
                                                            </td>
                                                        </tr>
                                                        @endif
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- CTA -->
                                        <table cellpadding="0" cellspacing="0" style="margin:32px auto 0;">
                                            <tr>
                                                <td style="background-color:#0369a1;border-radius:12px;">
                                                    <a href="{{ $dashboardUrl }}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                                                        View &amp; Download Certificate
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.5;">
                                            You can download a printable PDF version from your Certificates page. Your certificate includes a QR code for instant verification.
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
