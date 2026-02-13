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
                            @php
                                $headerGradients = [
                                    'accepted' => 'linear-gradient(135deg,#064e3b 0%,#047857 50%,#10b981 100%)',
                                    'declined' => 'linear-gradient(135deg,#7f1d1d 0%,#b91c1c 50%,#ef4444 100%)',
                                    'waitlisted' => 'linear-gradient(135deg,#78350f 0%,#b45309 50%,#f59e0b 100%)',
                                ];
                                $gradient = $headerGradients[$status] ?? 'linear-gradient(135deg,#0c4a6e 0%,#0369a1 50%,#0ea5e9 100%)';
                                $icons = ['accepted' => '&#127881;', 'declined' => '&#128532;', 'waitlisted' => '&#9203;'];
                                $icon = $icons[$status] ?? '&#128196;';
                                $iconBgs = [
                                    'accepted' => 'linear-gradient(135deg,#d1fae5,#a7f3d0)',
                                    'declined' => 'linear-gradient(135deg,#fee2e2,#fecaca)',
                                    'waitlisted' => 'linear-gradient(135deg,#fef3c7,#fde68a)',
                                ];
                                $iconBg = $iconBgs[$status] ?? 'linear-gradient(135deg,#e0f2fe,#bae6fd)';
                                $statusColors = ['accepted' => '#047857', 'declined' => '#b91c1c', 'waitlisted' => '#b45309'];
                                $statusColor = $statusColors[$status] ?? '#0369a1';
                                $statusBgs = [
                                    'accepted' => 'background:linear-gradient(135deg,#ecfdf5,#d1fae5);border:1px solid #6ee7b7;',
                                    'declined' => 'background:linear-gradient(135deg,#fef2f2,#fee2e2);border:1px solid #fca5a5;',
                                    'waitlisted' => 'background:linear-gradient(135deg,#fffbeb,#fef3c7);border:1px solid #fde68a;',
                                ];
                                $statusBg = $statusBgs[$status] ?? 'background:linear-gradient(135deg,#f0f9ff,#e0f2fe);border:1px solid #bae6fd;';
                                $label = ucfirst($status);
                                $ctaGradients = [
                                    'accepted' => 'linear-gradient(135deg,#047857,#10b981)',
                                    'declined' => 'linear-gradient(135deg,#0369a1,#0ea5e9)',
                                    'waitlisted' => 'linear-gradient(135deg,#b45309,#f59e0b)',
                                ];
                                $ctaGradient = $ctaGradients[$status] ?? 'linear-gradient(135deg,#0369a1,#0ea5e9)';
                            @endphp
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:0 0 16px 16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                                <!-- Header -->
                                <tr>
                                    <td style="background:{{ $gradient }};padding:40px 48px;text-align:center;">
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
                                        <div style="display:inline-block;width:72px;height:72px;background:{{ $iconBg }};border-radius:50%;line-height:72px;font-size:36px;">{{ $icon }}</div>
                                    </td>
                                </tr>

                                <!-- Body -->
                                <tr>
                                    <td style="padding:24px 48px 40px;">
                                        <h1 style="margin:0 0 8px;color:#0c4a6e;font-size:24px;font-weight:700;text-align:center;">Application {{ $label }}</h1>
                                        <p style="margin:0 0 24px;color:#64748b;font-size:15px;text-align:center;line-height:1.5;">
                                            Hi {{ $application->student->first_name }}, your application has been updated.
                                        </p>

                                        <!-- Status Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="{{ $statusBg }}border-radius:14px;margin-bottom:24px;">
                                            <tr>
                                                <td style="padding:20px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Rotation</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:700;text-align:right;">{{ $application->slot->title }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Site</td>
                                                            <td style="padding:4px 0;color:#0c4a6e;font-size:14px;font-weight:600;text-align:right;">{{ $application->slot->site->name ?? 'Clinical Site' }}</td>
                                                        </tr>
                                                        <tr>
                                                            <td style="padding:4px 0;color:#64748b;font-size:14px;">Status</td>
                                                            <td style="padding:4px 0;font-size:14px;font-weight:800;text-align:right;color:{{ $statusColor }};">{{ $label }}</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>

                                        @if($application->notes)
                                        <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border-left:4px solid {{ $statusColor }};border-radius:0 14px 14px 0;margin-bottom:24px;">
                                            <tr>
                                                <td style="padding:16px 20px;">
                                                    <p style="margin:0 0 4px;color:#0c4a6e;font-size:13px;font-weight:700;">Note from reviewer:</p>
                                                    <p style="margin:0;color:#475569;font-size:14px;line-height:1.6;">{{ $application->notes }}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        @endif

                                        @if($status === 'accepted')
                                        <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.6;text-align:center;">
                                            Congratulations! You can now begin logging your clinical hours for this rotation.
                                        </p>
                                        @elseif($status === 'waitlisted')
                                        <p style="margin:0 0 28px;color:#475569;font-size:15px;line-height:1.6;text-align:center;">
                                            You've been placed on the waitlist. We'll notify you if a spot opens up.
                                        </p>
                                        @endif

                                        <!-- CTA -->
                                        <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                                            <tr>
                                                <td style="background:{{ $ctaGradient }};border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
                                                    <a href="{{ env('FRONTEND_URL', 'https://michelevens.github.io/ClinicLink') }}/applications" style="display:inline-block;padding:16px 36px;color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;">View Applications</a>
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
