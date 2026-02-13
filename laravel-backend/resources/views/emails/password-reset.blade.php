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
                                    <td style="background:linear-gradient(135deg,#312e81 0%,#4338ca 50%,#6366f1 100%);padding:40px 48px;text-align:center;">
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
                                        <div style="display:inline-block;width:72px;height:72px;background:linear-gradient(135deg,#e0e7ff,#c7d2fe);border-radius:50%;line-height:72px;font-size:36px;">&#128274;</div>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:24px 48px 40px;">
                                        <h1 style="margin:0 0 8px;color:#0c4a6e;font-size:24px;font-weight:700;text-align:center;">Password Has Been Reset</h1>
                                        <p style="margin:0 0 24px;color:#64748b;font-size:15px;text-align:center;line-height:1.5;">
                                            Hi {{ $user->first_name }}, an administrator has reset your password.
                                        </p>

                                        <!-- Password Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#eef2ff,#e0e7ff);border:2px solid #818cf8;border-radius:14px;margin-bottom:24px;">
                                            <tr>
                                                <td style="padding:24px;text-align:center;">
                                                    <p style="margin:0 0 8px;color:#4338ca;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px;">Your Temporary Password</p>
                                                    <p style="margin:0;font-size:22px;font-weight:800;font-family:'Courier New',monospace;color:#1e1b4b;letter-spacing:2px;">{{ $temporaryPassword }}</p>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;text-align:center;">
                                            Please log in with this temporary password and change it immediately from your profile settings.
                                        </p>

                                        <!-- Security Warning -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:0 14px 14px 0;margin-bottom:28px;">
                                            <tr>
                                                <td style="padding:16px 20px;">
                                                    <p style="margin:0 0 4px;color:#92400e;font-size:13px;font-weight:700;">&#128272; Security Tip</p>
                                                    <p style="margin:0;color:#78716c;font-size:13px;line-height:1.5;">
                                                        Change your password as soon as possible after logging in. Do not share this email with anyone.
                                                    </p>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- CTA -->
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="background:linear-gradient(135deg,#4338ca,#6366f1);border-radius:12px;box-shadow:0 4px 12px rgba(99,102,241,0.3);">
                                                    <a href="{{ env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink') }}/login" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">Log In Now</a>
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
