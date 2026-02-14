<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Hour Logs Export</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 20px; }
        .header { background: linear-gradient(135deg, #0369a1, #0ea5e9); color: #fff; padding: 24px 32px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; }
        .header p { margin: 0; opacity: 0.85; font-size: 12px; }
        .stats { display: flex; margin-bottom: 20px; }
        .stat-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-right: 12px; text-align: center; }
        .stat-box:last-child { margin-right: 0; }
        .stat-value { font-size: 22px; font-weight: 700; color: #0369a1; }
        .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; }
        thead th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
        tbody td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        tbody tr:nth-child(even) { background: #fafafa; }
        .status-approved { color: #16a34a; font-weight: 600; }
        .status-pending { color: #d97706; font-weight: 600; }
        .status-rejected { color: #dc2626; font-weight: 600; }
        .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Clinical Hour Log Report</h1>
        <p>Generated {{ now()->format('M j, Y \a\t g:i A') }} &bull; {{ $user->full_name }}</p>
    </div>

    <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
            <td style="width: 33%; padding: 0 6px 0 0;">
                <div class="stat-box">
                    <div class="stat-value">{{ number_format($totalHours, 1) }}</div>
                    <div class="stat-label">Total Hours</div>
                </div>
            </td>
            <td style="width: 33%; padding: 0 6px;">
                <div class="stat-box">
                    <div class="stat-value" style="color: #16a34a;">{{ number_format($approvedHours, 1) }}</div>
                    <div class="stat-label">Approved</div>
                </div>
            </td>
            <td style="width: 33%; padding: 0 0 0 6px;">
                <div class="stat-box">
                    <div class="stat-value" style="color: #d97706;">{{ number_format($pendingHours, 1) }}</div>
                    <div class="stat-label">Pending</div>
                </div>
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Student</th>
                <th>Rotation</th>
                <th>Site</th>
                <th>Hours</th>
                <th>Category</th>
                <th>Status</th>
                <th>Description</th>
            </tr>
        </thead>
        <tbody>
            @forelse($logs as $log)
            <tr>
                <td>{{ $log->date?->format('M j, Y') }}</td>
                <td>{{ $log->student?->full_name ?? '-' }}</td>
                <td>{{ $log->slot?->title ?? '-' }}</td>
                <td>{{ $log->slot?->site?->name ?? '-' }}</td>
                <td><strong>{{ number_format($log->hours_worked, 1) }}</strong></td>
                <td>{{ ucfirst(str_replace('_', ' ', $log->category)) }}</td>
                <td class="status-{{ $log->status }}">{{ ucfirst($log->status) }}</td>
                <td>{{ \Illuminate\Support\Str::limit($log->description, 60) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="8" style="text-align: center; color: #94a3b8; padding: 24px;">No hour logs found.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        ClinicLink &bull; Clinical Hour Log Export &bull; {{ now()->format('Y') }}
    </div>
</body>
</html>
