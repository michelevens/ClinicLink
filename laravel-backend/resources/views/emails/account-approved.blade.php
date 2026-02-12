<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f4;padding:40px 20px;">
        <tr>
            <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background:linear-gradient(135deg,#22c55e,#16a34a);padding:32px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">ClinicLink</h1>
                            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Clinical Rotation Matching Platform</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#1c1917;font-size:20px;font-weight:600;">Account Approved!</h2>
                            <p style="margin:0 0 16px;color:#57534e;font-size:15px;line-height:1.6;">
                                Great news, {{ $user->first_name }}! Your ClinicLink account has been approved and activated.
                            </p>
                            <p style="margin:0 0 24px;color:#57534e;font-size:15px;line-height:1.6;">
                                You can now log in and start using the platform.
                            </p>
                            <div style="margin:0 0 24px;padding:16px;background-color:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;">
                                <p style="margin:0;color:#57534e;font-size:14px;line-height:1.6;">
                                    <strong>Role:</strong> {{ ucfirst(str_replace('_', ' ', $user->role)) }}<br>
                                    <strong>Email:</strong> {{ $user->email }}
                                </p>
                            </div>
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                <tr>
                                    <td style="background-color:#22c55e;border-radius:12px;">
                                        <a href="{{ $loginUrl }}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                                            Log In Now
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 40px;background-color:#fafaf9;border-top:1px solid #e7e5e4;text-align:center;">
                            <p style="margin:0;color:#a8a29e;font-size:13px;">
                                &copy; {{ date('Y') }} ClinicLink. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
