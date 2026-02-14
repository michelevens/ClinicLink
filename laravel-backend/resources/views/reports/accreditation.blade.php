<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #1e293b; line-height: 1.5; }

        .header { background: linear-gradient(135deg, #0c4a6e, #0369a1); color: #ffffff; padding: 30px 40px; }
        .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .header .subtitle { font-size: 14px; opacity: 0.85; }
        .header .meta { margin-top: 12px; font-size: 11px; opacity: 0.7; }

        .content { padding: 30px 40px; }

        .section { margin-bottom: 28px; }
        .section-title { font-size: 16px; font-weight: 700; color: #0c4a6e; border-bottom: 2px solid #0ea5e9; padding-bottom: 6px; margin-bottom: 14px; }

        .metrics { display: table; width: 100%; margin-bottom: 20px; }
        .metric-box { display: table-cell; width: 25%; padding: 12px; text-align: center; background: #f0f9ff; border: 1px solid #bae6fd; }
        .metric-box:first-child { border-radius: 8px 0 0 8px; }
        .metric-box:last-child { border-radius: 0 8px 8px 0; }
        .metric-value { font-size: 22px; font-weight: 800; color: #0369a1; }
        .metric-label { font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }

        table.data-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        table.data-table th { background: #f1f5f9; color: #475569; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; padding: 8px 12px; text-align: left; border-bottom: 2px solid #e2e8f0; }
        table.data-table td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 12px; }
        table.data-table tr:nth-child(even) td { background: #f8fafc; }

        .footer { padding: 20px 40px; background: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center; }

        .page-break { page-break-after: always; }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>{{ $report->title }}</h1>
        <div class="subtitle">{{ $university->name }}</div>
        <div class="meta">
            Report Type: {{ str_replace('_', ' ', ucwords($report->report_type, '_')) }}
            &nbsp;|&nbsp;
            Period: {{ $report->parameters['date_from'] ?? 'N/A' }} to {{ $report->parameters['date_to'] ?? 'N/A' }}
            &nbsp;|&nbsp;
            Generated: {{ now()->format('M d, Y h:i A') }}
        </div>
    </div>

    <div class="content">
        <!-- Executive Summary -->
        <div class="section">
            <div class="section-title">Executive Summary</div>

            @if(isset($data['total_students']))
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:16px;">
                <tr>
                    <td style="width:25%;padding:8px;text-align:center;background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px 0 0 8px;">
                        <div style="font-size:22px;font-weight:800;color:#0369a1;">{{ $data['total_students'] ?? 0 }}</div>
                        <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-top:4px;">Total Students</div>
                    </td>
                    <td style="width:25%;padding:8px;text-align:center;background:#f0f9ff;border:1px solid #bae6fd;">
                        <div style="font-size:22px;font-weight:800;color:#0369a1;">{{ $data['placed_students'] ?? $data['students_placed'] ?? 0 }}</div>
                        <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-top:4px;">Placed</div>
                    </td>
                    <td style="width:25%;padding:8px;text-align:center;background:#f0f9ff;border:1px solid #bae6fd;">
                        <div style="font-size:22px;font-weight:800;color:#0369a1;">{{ $data['placement_rate'] ?? 0 }}%</div>
                        <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-top:4px;">Placement Rate</div>
                    </td>
                    <td style="width:25%;padding:8px;text-align:center;background:#f0f9ff;border:1px solid #bae6fd;border-radius:0 8px 8px 0;">
                        <div style="font-size:22px;font-weight:800;color:#0369a1;">{{ number_format($data['total_hours'] ?? 0, 0) }}</div>
                        <div style="font-size:10px;color:#64748b;text-transform:uppercase;margin-top:4px;">Total Hours</div>
                    </td>
                </tr>
            </table>
            @endif

            @if(isset($data['avg_hours_per_student']))
            <p style="margin-bottom:8px;color:#475569;">Average hours per student: <strong>{{ $data['avg_hours_per_student'] }}</strong></p>
            @endif

            @if(isset($data['sites_used']))
            <p style="margin-bottom:8px;color:#475569;">Clinical sites utilized: <strong>{{ $data['sites_used'] }}</strong></p>
            @endif

            @if(isset($data['completed_placements']))
            <p style="margin-bottom:8px;color:#475569;">Completed placements in period: <strong>{{ $data['completed_placements'] }}</strong></p>
            @endif
        </div>

        <!-- Specialty Breakdown (if available) -->
        @if(isset($data['specialty_breakdown']) && count($data['specialty_breakdown']) > 0)
        <div class="section">
            <div class="section-title">Specialty Distribution</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Specialty</th>
                        <th style="text-align:right;">Placements</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['specialty_breakdown'] as $spec)
                    <tr>
                        <td>{{ $spec['specialty'] ?? 'Unknown' }}</td>
                        <td style="text-align:right;font-weight:600;">{{ $spec['count'] ?? 0 }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        <!-- Site data (for site_evaluation reports) -->
        @if(isset($data['capacity']))
        <div class="section">
            <div class="section-title">Site Capacity & Utilization</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th style="text-align:right;">Value</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td>Total Applications</td><td style="text-align:right;font-weight:600;">{{ $data['total_applications'] ?? 0 }}</td></tr>
                    <tr><td>Accepted</td><td style="text-align:right;font-weight:600;">{{ $data['accepted'] ?? 0 }}</td></tr>
                    <tr><td>Total Capacity</td><td style="text-align:right;font-weight:600;">{{ $data['capacity'] ?? 0 }}</td></tr>
                    <tr><td>Filled</td><td style="text-align:right;font-weight:600;">{{ $data['filled'] ?? 0 }}</td></tr>
                    <tr><td>Fill Rate</td><td style="text-align:right;font-weight:600;">{{ $data['fill_rate'] ?? 0 }}%</td></tr>
                    <tr><td>Clinical Hours</td><td style="text-align:right;font-weight:600;">{{ number_format($data['total_hours'] ?? 0, 1) }}</td></tr>
                </tbody>
            </table>
        </div>
        @endif

        <!-- Student Data (for student_outcomes reports) -->
        @if(isset($data['students']) && count($data['students']) > 0)
        <div class="section">
            <div class="section-title">Student Outcomes</div>
            <p style="margin-bottom:12px;color:#475569;">
                {{ $data['total_students'] ?? 0 }} students | Average hours: {{ $data['avg_hours'] ?? 0 }}
            </p>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th style="text-align:right;">Hours Completed</th>
                        <th style="text-align:right;">Placements</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(array_slice($data['students'], 0, 50) as $student)
                    <tr>
                        <td>{{ $student['name'] }}</td>
                        <td style="text-align:right;font-weight:600;">{{ $student['hours_completed'] }}</td>
                        <td style="text-align:right;font-weight:600;">{{ $student['placements'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
            @if(count($data['students']) > 50)
            <p style="color:#94a3b8;font-size:11px;margin-top:8px;">Showing top 50 of {{ count($data['students']) }} students.</p>
            @endif
        </div>
        @endif

        <!-- Clinical Hours Breakdown -->
        @if(isset($data['by_site']) && count($data['by_site']) > 0)
        <div class="section">
            <div class="section-title">Clinical Hours by Site</div>
            <p style="margin-bottom:12px;color:#475569;">
                Total: {{ number_format($data['total_hours'] ?? 0, 1) }} hours | {{ $data['total_entries'] ?? 0 }} log entries
            </p>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Site</th>
                        <th style="text-align:right;">Hours</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach($data['by_site'] as $site => $hours)
                    <tr>
                        <td>{{ $site }}</td>
                        <td style="text-align:right;font-weight:600;">{{ $hours }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif

        @if(isset($data['by_student']) && count($data['by_student']) > 0)
        <div class="section">
            <div class="section-title">Clinical Hours by Student</div>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Student</th>
                        <th style="text-align:right;">Hours</th>
                        <th style="text-align:right;">Entries</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach(array_slice($data['by_student'], 0, 50) as $entry)
                    <tr>
                        <td>{{ $entry['name'] }}</td>
                        <td style="text-align:right;font-weight:600;">{{ $entry['hours'] }}</td>
                        <td style="text-align:right;">{{ $entry['entries'] }}</td>
                    </tr>
                    @endforeach
                </tbody>
            </table>
        </div>
        @endif
    </div>

    <!-- Footer -->
    <div class="footer">
        <p>Generated by ClinicLink &mdash; {{ now()->format('M d, Y h:i A') }}</p>
        <p>&copy; {{ date('Y') }} ClinicLink. All rights reserved. This report is confidential.</p>
    </div>
</body>
</html>
