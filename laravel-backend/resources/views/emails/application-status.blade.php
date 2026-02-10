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
                                $colors = ['accepted' => '#22c55e', 'declined' => '#ef4444', 'waitlisted' => '#f59e0b'];
                                $color = $colors[$status] ?? '#8b5cf6';
                                $label = ucfirst($status);
                            @endphp
                            <h2 style="margin:0 0 16px;color:#1c1917;font-size:20px;font-weight:600;">Application {{ $label }}</h2>
                            <p style="margin:0 0 16px;color:#57534e;font-size:15px;line-height:1.6;">
                                Hi {{ $application->student->first_name }},
                            </p>
                            <p style="margin:0 0 20px;color:#57534e;font-size:15px;line-height:1.6;">
                                Your application for <strong>{{ $application->slot->title }}</strong>
                                at <strong>{{ $application->slot->site->name ?? 'the clinical site' }}</strong>
                                has been <span style="color:{{ $color }};font-weight:600;">{{ strtolower($label) }}</span>.
                            </p>
                            @if($application->notes)
                            <div style="margin:0 0 24px;padding:16px;background-color:#fafaf9;border-radius:12px;border-left:4px solid {{ $color }};">
                                <p style="margin:0;color:#57534e;font-size:14px;line-height:1.6;">
                                    <strong>Note:</strong> {{ $application->notes }}
                                </p>
                            </div>
                            @endif
                            @if($status === 'accepted')
                            <p style="margin:0 0 24px;color:#57534e;font-size:15px;line-height:1.6;">
                                Congratulations! You can now begin logging your clinical hours for this rotation.
                            </p>
                            @elseif($status === 'waitlisted')
                            <p style="margin:0 0 24px;color:#57534e;font-size:15px;line-height:1.6;">
                                You've been placed on the waitlist. We'll notify you if a spot opens up.
                            </p>
                            @endif
                            <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                <tr>
                                    <td style="background-color:#8b5cf6;border-radius:12px;">
                                        <a href="{{ env('FRONTEND_URL', 'https://cliniclink.vercel.app') }}/applications" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">
                                            View Applications
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
