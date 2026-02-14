<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Compliance Export</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 20px; }
        .header { background: linear-gradient(135deg, #065f46, #059669); color: #fff; padding: 24px 32px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; }
        .header p { margin: 0; opacity: 0.85; font-size: 12px; }
        .stat-box { display: inline-block; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-right: 12px; text-align: center; min-width: 120px; }
        .stat-value { font-size: 22px; font-weight: 700; color: #059669; }
        .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; }
        thead th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
        tbody td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        tbody tr:nth-child(even) { background: #fafafa; }
        .status-compliant { color: #16a34a; font-weight: 600; }
        .status-in-progress { color: #d97706; font-weight: 600; }
        .status-non-compliant { color: #dc2626; font-weight: 600; }
        .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Compliance Report</h1>
        <p>Generated {{ now()->format('M j, Y \a\t g:i A') }} &bull; {{ $user->full_name }}</p>
    </div>

    <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
            <td style="width: 33%; padding: 0 6px 0 0;">
                <div class="stat-box">
                    <div class="stat-value">{{ $total }}</div>
                    <div class="stat-label">Total Students</div>
                </div>
            </td>
            <td style="width: 33%; padding: 0 6px;">
                <div class="stat-box">
                    <div class="stat-value">{{ $compliant }}</div>
                    <div class="stat-label">Compliant</div>
                </div>
            </td>
            <td style="width: 33%; padding: 0 0 0 6px;">
                <div class="stat-box">
                    <div class="stat-value" style="color: {{ $total > 0 ? ($compliant === $total ? '#16a34a' : '#d97706') : '#94a3b8' }};">{{ $total > 0 ? round(($compliant / $total) * 100) : 0 }}%</div>
                    <div class="stat-label">Compliance Rate</div>
                </div>
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Rotation</th>
                <th>Site</th>
                <th>Status</th>
                <th>Credentials</th>
                <th>Expired</th>
                <th>Expiring</th>
                <th>Tasks Done</th>
                <th>Verified</th>
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
            @php
                $statusClass = match($row['overall_status']) {
                    'Compliant' => 'status-compliant',
                    'In Progress' => 'status-in-progress',
                    default => 'status-non-compliant',
                };
            @endphp
            <tr>
                <td>{{ $row['student_name'] }}</td>
                <td>{{ $row['student_email'] }}</td>
                <td>{{ $row['rotation'] }}</td>
                <td>{{ $row['site_name'] }}</td>
                <td class="{{ $statusClass }}">{{ $row['overall_status'] }}</td>
                <td>{{ $row['credentials_valid'] }}/{{ $row['credentials_total'] }}</td>
                <td style="color: {{ $row['credentials_expired'] > 0 ? '#dc2626' : '#94a3b8' }};">{{ $row['credentials_expired'] }}</td>
                <td style="color: {{ $row['credentials_expiring_soon'] > 0 ? '#d97706' : '#94a3b8' }};">{{ $row['credentials_expiring_soon'] }}</td>
                <td>{{ $row['tasks_completed'] }}/{{ $row['tasks_total'] }}</td>
                <td>{{ $row['tasks_verified'] }}/{{ $row['tasks_total'] }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="10" style="text-align: center; color: #94a3b8; padding: 24px;">No compliance data found.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        ClinicLink &bull; Compliance Export &bull; {{ now()->format('Y') }}
    </div>
</body>
</html>
