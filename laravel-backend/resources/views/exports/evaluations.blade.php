<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Evaluations Export</title>
    <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; font-size: 11px; color: #1e293b; margin: 0; padding: 20px; }
        .header { background: linear-gradient(135deg, #92400e, #d97706); color: #fff; padding: 24px 32px; border-radius: 12px; margin-bottom: 24px; }
        .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; }
        .header p { margin: 0; opacity: 0.85; font-size: 12px; }
        .stats { display: flex; margin-bottom: 20px; }
        .stat-box { flex: 1; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; margin-right: 12px; text-align: center; }
        .stat-box:last-child { margin-right: 0; }
        .stat-value { font-size: 22px; font-weight: 700; color: #d97706; }
        .stat-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 2px; }
        table { width: 100%; border-collapse: collapse; border-radius: 10px; overflow: hidden; }
        thead th { background: #f1f5f9; padding: 10px 12px; text-align: left; font-size: 10px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; }
        tbody td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11px; }
        tbody tr:nth-child(even) { background: #fafafa; }
        .score { font-weight: 700; }
        .score-high { color: #16a34a; }
        .score-mid { color: #d97706; }
        .score-low { color: #dc2626; }
        .footer { margin-top: 24px; text-align: center; font-size: 10px; color: #94a3b8; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Evaluations Report</h1>
        <p>Generated {{ now()->format('M j, Y \a\t g:i A') }} &bull; {{ $user->full_name }}</p>
    </div>

    <table style="width: 100%; border: none; margin-bottom: 20px;">
        <tr>
            <td style="width: 33%; padding: 0 6px 0 0;">
                <div class="stat-box">
                    <div class="stat-value">{{ $evaluations->count() }}</div>
                    <div class="stat-label">Total Evaluations</div>
                </div>
            </td>
            <td style="width: 33%; padding: 0 6px;">
                <div class="stat-box">
                    <div class="stat-value">{{ $avgScore ? number_format($avgScore, 1) : 'N/A' }}</div>
                    <div class="stat-label">Average Score</div>
                </div>
            </td>
            <td style="width: 33%; padding: 0 0 0 6px;">
                <div class="stat-box">
                    <div class="stat-value" style="color: #0369a1;">{{ $evaluations->where('is_submitted', true)->count() }}</div>
                    <div class="stat-label">Submitted</div>
                </div>
            </td>
        </tr>
    </table>

    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Student</th>
                <th>Preceptor</th>
                <th>Rotation</th>
                <th>Site</th>
                <th>Score</th>
                <th>Strengths</th>
                <th>Areas for Improvement</th>
            </tr>
        </thead>
        <tbody>
            @forelse($evaluations as $eval)
            @php
                $scoreClass = $eval->overall_score >= 4 ? 'score-high' : ($eval->overall_score >= 3 ? 'score-mid' : 'score-low');
            @endphp
            <tr>
                <td>{{ $eval->created_at?->format('M j, Y') }}</td>
                <td>{{ ucfirst(str_replace('_', ' ', $eval->type)) }}</td>
                <td>{{ $eval->student?->full_name ?? '-' }}</td>
                <td>{{ $eval->preceptor?->full_name ?? '-' }}</td>
                <td>{{ $eval->slot?->title ?? '-' }}</td>
                <td>{{ $eval->slot?->site?->name ?? '-' }}</td>
                <td class="score {{ $scoreClass }}">{{ number_format($eval->overall_score, 1) }}/5.0</td>
                <td>{{ \Illuminate\Support\Str::limit($eval->strengths, 50) }}</td>
                <td>{{ \Illuminate\Support\Str::limit($eval->areas_for_improvement, 50) }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="9" style="text-align: center; color: #94a3b8; padding: 24px;">No evaluations found.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        ClinicLink &bull; Evaluations Export &bull; {{ now()->format('Y') }}
    </div>
</body>
</html>
