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
                            <h2 style="margin:0 0 16px;color:#1c1917;font-size:20px;font-weight:600;">Registration Received</h2>
                            <p style="margin:0 0 16px;color:#57534e;font-size:15px;line-height:1.6;">
                                Hi {{ $user->first_name }}, thank you for registering with ClinicLink!
                            </p>
                            <div style="margin:0 0 24px;padding:16px;background-color:#faf5ff;border-radius:12px;border:1px solid #e9d5ff;">
                                <p style="margin:0 0 8px;color:#6b21a8;font-size:14px;font-weight:600;">Your Registration Details</p>
                                <p style="margin:0;color:#57534e;font-size:14px;line-height:1.6;">
                                    <strong>Name:</strong> {{ $user->first_name }} {{ $user->last_name }}<br>
                                    <strong>Email:</strong> {{ $user->email }}<br>
                                    <strong>Role:</strong> {{ ucfirst(str_replace('_', ' ', $user->role)) }}
                                </p>
                            </div>
                            <div style="margin:0 0 24px;padding:16px;background-color:#fffbeb;border-radius:12px;border:1px solid #fde68a;">
                                <p style="margin:0 0 4px;color:#92400e;font-size:14px;font-weight:600;">Pending Approval</p>
                                <p style="margin:0;color:#78716c;font-size:14px;line-height:1.6;">
                                    Your account is currently under review. An administrator will review and approve your account shortly. You'll receive another email once your account is activated.
                                </p>
                            </div>
                            <p style="margin:0;color:#a8a29e;font-size:13px;line-height:1.6;">
                                If you have any questions, please contact the ClinicLink admin team.
                            </p>
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
