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
                        </td>
                    </tr>
                    <!-- Body -->
                    <tr>
                        <td style="padding:40px;">
                            @php
                                $isApproved = $status === 'approved';
                                $color = $isApproved ? '#22c55e' : '#ef4444';
                                $label = $isApproved ? 'Approved' : 'Rejected';
                            @endphp
                            <h2 style="margin:0 0 16px;color:#1c1917;font-size:20px;font-weight:600;">
                                Hour Log {{ $label }}
                            </h2>
                            <p style="margin:0 0 16px;color:#57534e;font-size:15px;line-height:1.6;">
                                Hi {{ $hourLog->student->first_name }},
                            </p>
                            <p style="margin:0 0 20px;color:#57534e;font-size:15px;line-height:1.6;">
                                Your hour log entry has been
                                <span style="color:{{ $color }};font-weight:600;">{{ strtolower($label) }}</span>.
                            </p>
                            <div style="margin:0 0 24px;padding:16px;background-color:#fafaf9;border-radius:12px;">
                                <table width="100%" cellpadding="0" cellspacing="0">
                                    <tr>
                                        <td style="padding:4px 0;color:#78716c;font-size:14px;">Date:</td>
                                        <td style="padding:4px 0;color:#1c1917;font-size:14px;font-weight:600;text-align:right;">{{ $hourLog->date }}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:4px 0;color:#78716c;font-size:14px;">Hours:</td>
                                        <td style="padding:4px 0;color:#1c1917;font-size:14px;font-weight:600;text-align:right;">{{ $hourLog->hours_worked }}h</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:4px 0;color:#78716c;font-size:14px;">Category:</td>
                                        <td style="padding:4px 0;color:#1c1917;font-size:14px;font-weight:600;text-align:right;">{{ ucfirst(str_replace('_', ' ', $hourLog->category)) }}</td>
                                    </tr>
                                </table>
                            </div>
                            @if(!$isApproved && $hourLog->rejection_reason)
                            <div style="margin:0 0 24px;padding:16px;background-color:#fef2f2;border-radius:12px;border-left:4px solid #ef4444;">
                                <p style="margin:0;color:#57534e;font-size:14px;line-height:1.6;">
                                    <strong>Reason:</strong> {{ $hourLog->rejection_reason }}
                                </p>
                            </div>
                            @endif
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                <tr>
                                    <td style="background-color:#8b5cf6;border-radius:12px;">
                                        <a href="{{ env('FRONTEND_URL', 'https://cliniclink.vercel.app') }}/hours" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                                            View Hour Log
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td style="padding:24px 40px;background-color:#fafaf9;border-top:1px solid #e7e5e4;text-align:center;">
                            <p style="margin:0;color:#a8a29e;font-size:13px;">&copy; {{ date('Y') }} ClinicLink. All rights reserved.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
