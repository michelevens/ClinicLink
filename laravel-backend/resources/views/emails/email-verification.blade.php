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
                        <td style="height:6px;background-color:#0ea5e9;border-radius:12px 12px 0 0;"></td>
                    </tr>
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;">
                                <!-- Header -->
                                <tr>
                                    <td style="background-color:#0c4a6e;padding:40px 48px;text-align:center;">
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="width:36px;height:36px;background-color:rgba(255,255,255,0.2);border-radius:10px;text-align:center;vertical-align:middle;font-size:20px;color:#ffffff;font-weight:bold;">+</td>
                                                <td style="padding-left:12px;font-size:26px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">ClinicLink</td>
                                            </tr>
                                        </table>
                                        <p style="margin:12px 0 0;color:rgba(255,255,255,0.8);font-size:13px;letter-spacing:2px;text-transform:uppercase;">Clinical Rotation Platform</p>
                                    </td>
                                </tr>

                                <!-- Icon -->
                                <tr>
                                    <td style="text-align:center;padding:32px 48px 0;">
                                        <div style="display:inline-block;width:72px;height:72px;background-color:#e0f2fe;border-radius:50%;line-height:72px;font-size:36px;">&#9993;</div>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:24px 48px 40px;">
                                        <h1 style="margin:0 0 8px;color:#0c4a6e;font-size:24px;font-weight:700;text-align:center;">Verify Your Email</h1>
                                        <p style="margin:0 0 24px;color:#64748b;font-size:15px;text-align:center;line-height:1.5;">
                                            Hi {{ $user->first_name }}, thanks for signing up! Please verify your email address to complete your ClinicLink registration.
                                        </p>

                                        <!-- Info Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f9ff;border:1px solid #bae6fd;border-radius:14px;margin-bottom:28px;">
                                            <tr>
                                                <td style="padding:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Name</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:700;text-align:right;">{{ $user->first_name }} {{ $user->last_name }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Email</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:600;text-align:right;">{{ $user->email }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Role</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:700;text-align:right;">{{ ucfirst(str_replace('_', ' ', $user->role)) }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        <!-- CTA -->
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="background-color:#0369a1;border-radius:12px;">
                                                    <a href="{{ $verificationUrl }}" style="display:inline-block;padding:16px 40px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;letter-spacing:0.3px;">Verify Email Address</a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;text-align:center;line-height:1.5;">
                                            This link expires in 24 hours. If you didn't create an account on ClinicLink, you can safely ignore this email.
                                        </p>

                                        <!-- Fallback link -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;">
                                            <tr>
                                                <td style="padding:16px;">
                                                    <p style="margin:0 0 4px;color:#64748b;font-size:12px;">If the button doesn't work, copy and paste this link:</p>
                                                    <p style="margin:0;color:#0369a1;font-size:12px;word-break:break-all;">{{ $verificationUrl }}</p>
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
