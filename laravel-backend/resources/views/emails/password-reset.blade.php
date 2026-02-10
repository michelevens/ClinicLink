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
                        <td style="background:linear-gradient(135deg,#8b5cf6,#7c3aed);padding:32px 40px;text-align:center;">
                            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">ClinicLink</h1>
                            <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Clinical Rotation Matching Platform</p>
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            <h2 style="margin:0 0 16px;color:#1c1917;font-size:20px;font-weight:600;">Reset Your Password</h2>
                            <p style="margin:0 0 16px;color:#57534e;font-size:15px;line-height:1.6;">
                                Hi {{ $user->first_name }}, we received a request to reset your password. Click the button below to create a new password.
                            </p>
                            <table cellpadding="0" cellspacing="0" style="margin:24px auto;">
                                <tr>
                                    <td style="background-color:#8b5cf6;border-radius:12px;">
                                        <a href="{{ $resetUrl }}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:24px 0 0;color:#a8a29e;font-size:13px;line-height:1.6;">
                                This link will expire in <strong>60 minutes</strong>. If you didn't request a password reset, you can safely ignore this email.
                            </p>
                            <div style="margin-top:24px;padding:16px;background-color:#fafaf9;border-radius:12px;border-left:4px solid #f59e0b;">
                                <p style="margin:0;color:#78716c;font-size:13px;line-height:1.5;">
                                    <strong style="color:#92400e;">Security tip:</strong> ClinicLink will never ask for your password via email. If you didn't request this reset, please secure your account.
                                </p>
                            </div>
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
