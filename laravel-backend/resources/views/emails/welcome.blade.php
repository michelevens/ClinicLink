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
                            <h2 style="margin:0 0 16px;color:#1c1917;font-size:20px;font-weight:600;">Welcome, {{ $user->first_name }}!</h2>
                            <p style="margin:0 0 16px;color:#57534e;font-size:15px;line-height:1.6;">
                                Your ClinicLink account has been created successfully. You're now part of a platform connecting healthcare students with clinical rotation opportunities.
                            </p>
                            <p style="margin:0 0 24px;color:#57534e;font-size:15px;line-height:1.6;">
                                <strong>Your role:</strong> {{ ucfirst(str_replace('_', ' ', $user->role)) }}<br>
                                <strong>Email:</strong> {{ $user->email }}
                            </p>
                            @if($user->role === 'student')
                            <p style="margin:0 0 24px;color:#57534e;font-size:15px;line-height:1.6;">
                                Here's what you can do next:
                            </p>
                            <ul style="margin:0 0 24px;padding-left:20px;color:#57534e;font-size:15px;line-height:1.8;">
                                <li>Complete your student profile</li>
                                <li>Upload your credentials (CPR, background check, etc.)</li>
                                <li>Browse and apply for clinical rotations</li>
                            </ul>
                            @elseif($user->role === 'preceptor')
                            <p style="margin:0 0 24px;color:#57534e;font-size:15px;line-height:1.6;">
                                As a preceptor, you can review student applications, approve hour logs, and write evaluations for your assigned students.
                            </p>
                            @elseif($user->role === 'site_manager')
                            <p style="margin:0 0 24px;color:#57534e;font-size:15px;line-height:1.6;">
                                As a site manager, you can manage your clinical sites, create rotation slots, and review student applications.
                            </p>
                            @endif
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                <tr>
                                    <td style="background-color:#8b5cf6;border-radius:12px;">
                                        <a href="{{ env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink') }}/dashboard" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                                            Go to Dashboard
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            @if($resetUrl ?? false)
                            <div style="margin-top:24px;padding:16px;background-color:#faf5ff;border-radius:12px;border:1px solid #e9d5ff;text-align:center;">
                                <p style="margin:0 0 12px;color:#6b21a8;font-size:14px;font-weight:600;">Want to change your password?</p>
                                <a href="{{ $resetUrl }}" style="display:inline-block;padding:10px 24px;background-color:#ffffff;border:1px solid #c084fc;border-radius:8px;color:#7c3aed;text-decoration:none;font-size:13px;font-weight:600;">
                                    Set a New Password
                                </a>
                            </div>
                            @endif
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
