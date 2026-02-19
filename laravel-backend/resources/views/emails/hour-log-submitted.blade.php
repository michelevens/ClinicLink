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
                                    <td style="background:linear-gradient(135deg,#0c4a6e 0%,#0369a1 50%,#0284c7 100%);padding:40px 48px;text-align:center;">
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#ffffff;font-weight:bold;">+</td>
                                                <td style="padding-left:12px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">ClinicLink</td>
                                            </tr>
                                        </table>
                                        <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Clinical Rotation Platform</p>
                                    </td>
                                </tr>

                                <!-- Icon -->
                                <tr>
                                    <td style="text-align:center;padding:32px 48px 0;">
                                        <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#dbeafe,#bfdbfe);border-radius:50%;line-height:72px;font-size:36px;">⏰</div>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:24px 48px 40px;">
                                        <h1 style="margin:0 0 8px;color:#0c4a6e;font-size:24px;font-weight:700;text-align:center;">New Hour Log Awaiting Review</h1>
                                        <p style="margin:0 0 24px;color:#64748b;font-size:15px;text-align:center;line-height:1.5;">
                                            {{ $hourLog->student->first_name }} {{ $hourLog->student->last_name }} has submitted an hour log entry for your review.
                                        </p>

                                        <!-- Details Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:1px solid #93c5fd;border-radius:14px;margin-bottom:24px;">
                                            <tr>
                                                <td style="padding:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Student</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:700;text-align:right;">{{ $hourLog->student->first_name }} {{ $hourLog->student->last_name }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Date</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:700;text-align:right;">{{ $hourLog->date }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Hours Logged</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:700;text-align:right;">{{ $hourLog->hours_worked }}h</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Category</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:600;text-align:right;">{{ ucfirst(str_replace('_', ' ', $hourLog->category)) }}</td>
                                                        </tr>
                                                        @if($hourLog->slot && $hourLog->slot->site)
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Rotation Site</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:600;text-align:right;">{{ $hourLog->slot->site->name }}</td>
                                                        </tr>
                                                        @endif
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        @if($hourLog->description)
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-left:4px solid #0ea5e9;border-radius:0 14px 14px 0;margin-bottom:24px;">
                                            <tr>
                                                <td style="padding:16px 20px;">
                                                    <p style="margin:0 0 4px;color:#0c4a6e;font-size:13px;font-weight:700;">Description:</p>
                                                    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">{{ $hourLog->description }}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        @endif

                                        <!-- CTA -->
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="background-color:#0369a1;border-radius:12px;">
                                                    <a href="{{ env('FRONTEND_URL', 'https://cliniclink.health') }}/hours" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">Review Hour Log</a>
                                                </td>
                                            </tr>
                                        </table>
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
