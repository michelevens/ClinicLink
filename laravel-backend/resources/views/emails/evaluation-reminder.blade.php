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
                    <tr>
                        <td style="height:6px;background:linear-gradient(90deg,#0ea5e9,#8b5cf6,#ec4899);border-radius:12px 12px 0 0;"></td>
                    </tr>
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                                <tr>
                                    <td style="background:linear-gradient(135deg,#92400e 0%,#d97706 50%,#f59e0b 100%);padding:40px 48px;text-align:center;">
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#ffffff;font-weight:bold;">+</td>
                                                <td style="padding-left:12px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">ClinicLink</td>
                                            </tr>
                                        </table>
                                        <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Evaluation Reminder</p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="text-align:center;padding:32px 48px 0;">
                                        <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#fef3c7,#fde68a);border-radius:50%;line-height:72px;font-size:36px;">&#128203;</div>
                                    </td>
                                </tr>

                                @php
                                    $typeLabel = ucfirst(str_replace('_', '-', $evaluationType));
                                    $daysLeft = (int) now()->diffInDays($dueDate, false);
                                    $urgencyColor = $daysLeft <= 0 ? '#dc2626' : ($daysLeft <= 3 ? '#ea580c' : '#d97706');
                                    $urgencyText = $daysLeft <= 0 ? 'Due Today' : ($daysLeft === 1 ? '1 Day Left' : "{$daysLeft} Days Left");
                                @endphp

                                <tr>
                                    <td style="padding:24px 48px 40px;">
                                        <h1 style="margin:0 0 8px;color:#0c4a6e;font-size:24px;font-weight:700;text-align:center;">{{ $typeLabel }} Evaluation Due</h1>
                                        <p style="margin:0 0 24px;color:#64748b;font-size:15px;text-align:center;line-height:1.5;">Hi {{ $preceptor->first_name }}, a student evaluation requires your attention.</p>

                                        <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:14px;overflow:hidden;margin-bottom:24px;">
                                            <tr style="background-color:#f8fafc;">
                                                <td colspan="2" style="padding:16px;border-bottom:1px solid #e2e8f0;">
                                                    <span style="display:inline-block;padding:4px 12px;background:{{ $urgencyColor }};color:#ffffff;border-radius:8px;font-size:12px;font-weight:700;">{{ $urgencyText }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;width:40%;border-bottom:1px solid #f1f5f9;">Student</td>
                                                <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #f1f5f9;">{{ $student->full_name }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;">Evaluation Type</td>
                                                <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #f1f5f9;">{{ $typeLabel }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;">Due Date</td>
                                                <td style="padding:12px 16px;font-size:14px;color:{{ $urgencyColor }};font-weight:700;border-bottom:1px solid #f1f5f9;">{{ $dueDate->format('M j, Y') }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;border-bottom:1px solid #f1f5f9;">Rotation</td>
                                                <td style="padding:12px 16px;font-size:14px;color:#1e293b;border-bottom:1px solid #f1f5f9;">{{ $slot->title ?? $slot->specialty }}</td>
                                            </tr>
                                            <tr>
                                                <td style="padding:12px 16px;font-size:13px;font-weight:600;color:#64748b;">Rotation Dates</td>
                                                <td style="padding:12px 16px;font-size:14px;color:#1e293b;">{{ $slot->start_date->format('M j') }} &ndash; {{ $slot->end_date->format('M j, Y') }}</td>
                                            </tr>
                                        </table>

                                        <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.6;text-align:center;">Please complete this evaluation to help track student progress and meet program requirements.</p>

                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="background:linear-gradient(135deg,#0369a1,#0ea5e9);border-radius:12px;box-shadow:0 4px 12px rgba(14,165,233,0.3);">
                                                    <a href="{{ env('FRONTEND_URL', 'https://cliniclink.health') }}/evaluations" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">Complete Evaluation</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

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
