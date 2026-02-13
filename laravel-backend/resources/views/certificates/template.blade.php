<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Certificate - {{ $certificate->certificate_number }}</title>
    <style>
        @page {
            size: letter landscape;
            margin: 0;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #1c1917;
            width: 11in;
            height: 8.5in;
            position: relative;
            background: #fff;
            overflow: hidden;
        }

        .certificate {
            width: 11in;
            height: 8.5in;
            position: relative;
            overflow: hidden;
        }

        /* ── Decorative outer frame ─────────────────────── */
        .border-outer {
            position: absolute;
            top: 0.3in;
            left: 0.3in;
            right: 0.3in;
            bottom: 0.3in;
            border: 3px solid #0369a1;
            border-radius: 8px;
        }

        .border-inner {
            position: absolute;
            top: 0.38in;
            left: 0.38in;
            right: 0.38in;
            bottom: 0.38in;
            border: 1px solid #7dd3fc;
            border-radius: 6px;
        }

        /* Corner accents */
        .corner {
            position: absolute;
            width: 44px;
            height: 44px;
        }
        .corner-tl { top: 0.25in; left: 0.25in; border-top: 5px solid #0ea5e9; border-left: 5px solid #0ea5e9; border-radius: 6px 0 0 0; }
        .corner-tr { top: 0.25in; right: 0.25in; border-top: 5px solid #0ea5e9; border-right: 5px solid #0ea5e9; border-radius: 0 6px 0 0; }
        .corner-bl { bottom: 0.25in; left: 0.25in; border-bottom: 5px solid #0ea5e9; border-left: 5px solid #0ea5e9; border-radius: 0 0 0 6px; }
        .corner-br { bottom: 0.25in; right: 0.25in; border-bottom: 5px solid #0ea5e9; border-right: 5px solid #0ea5e9; border-radius: 0 0 6px 0; }

        /* Accent side lines */
        .accent-left {
            position: absolute;
            top: 1.2in;
            left: 0.5in;
            bottom: 1.2in;
            width: 2px;
            background: #bae6fd;
        }
        .accent-right {
            position: absolute;
            top: 1.2in;
            right: 0.5in;
            bottom: 1.2in;
            width: 2px;
            background: #bae6fd;
        }

        /* ── QR Code ─── upper right ────────────────────── */
        .qr-container {
            position: absolute;
            top: 0.5in;
            right: 0.65in;
            text-align: center;
            z-index: 10;
        }
        .qr-container img {
            width: 72px;
            height: 72px;
        }
        .qr-label {
            font-size: 6px;
            color: #78716c;
            margin-top: 2px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        /* ── Content area (absolute positioning, no flexbox) ─── */
        .content {
            position: absolute;
            top: 0.5in;
            left: 0.7in;
            right: 0.7in;
            bottom: 0.55in;
            text-align: center;
        }

        /* ── Header ─────────────────────────────────────── */
        .header {
            padding-top: 0.05in;
        }

        .logo-row {
            text-align: center;
            margin-bottom: 4px;
        }

        .logo-icon {
            display: inline-block;
            width: 28px;
            height: 28px;
            background: linear-gradient(135deg, #0ea5e9, #0369a1);
            border-radius: 7px;
            color: white;
            font-size: 16px;
            font-weight: bold;
            line-height: 28px;
            text-align: center;
            vertical-align: middle;
            margin-right: 8px;
        }

        .logo-text {
            display: inline-block;
            font-size: 20px;
            font-weight: 700;
            color: #0369a1;
            letter-spacing: 1px;
            vertical-align: middle;
        }

        .divider {
            width: 140px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #0ea5e9, transparent);
            margin: 6px auto;
        }

        .cert-title {
            font-size: 30px;
            font-weight: 300;
            letter-spacing: 10px;
            text-transform: uppercase;
            color: #0c4a6e;
            margin-bottom: 2px;
        }

        .cert-subtitle {
            font-size: 11px;
            letter-spacing: 4px;
            text-transform: uppercase;
            color: #78716c;
        }

        /* ── Body ───────────────────────────────────────── */
        .body {
            padding-top: 0.22in;
        }

        .presented-to {
            font-size: 10px;
            color: #78716c;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .student-name {
            font-size: 34px;
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 8px;
            font-style: italic;
        }

        .description {
            font-size: 10.5px;
            color: #57534e;
            line-height: 1.7;
            max-width: 7.5in;
            margin: 0 auto;
            padding-bottom: 0.15in;
        }

        /* ── Details grid (table layout for DomPDF) ───── */
        .details-grid {
            width: 85%;
            margin: 0 auto 0.12in;
            border-collapse: separate;
            border-spacing: 12px 4px;
        }

        .detail-item {
            text-align: center;
            padding: 4px 8px;
        }

        .detail-label {
            font-size: 7px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #a8a29e;
            margin-bottom: 2px;
        }

        .detail-value {
            font-size: 10px;
            font-weight: 600;
            color: #1c1917;
        }

        /* ── University info ─────────────────────────────── */
        .university-info {
            font-size: 9px;
            color: #78716c;
            margin-bottom: 0.12in;
        }

        /* ── Signatures ──────────────────────────────────── */
        .signatures {
            width: 85%;
            margin: 0 auto;
            border-collapse: separate;
            border-spacing: 30px 0;
        }

        .sig-block {
            text-align: center;
            width: 33.33%;
            vertical-align: bottom;
        }

        .sig-line {
            border-top: 1px solid #d6d3d1;
            padding-top: 5px;
            margin-top: 22px;
        }

        .sig-name {
            font-size: 9.5px;
            font-weight: 600;
            color: #1c1917;
        }

        .sig-title {
            font-size: 7.5px;
            color: #a8a29e;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 1px;
        }

        /* ── Footer ──────────────────────────────────────── */
        .footer {
            position: absolute;
            bottom: 0.5in;
            left: 0.7in;
            right: 0.7in;
            text-align: center;
            padding-top: 6px;
            border-top: 1px solid #e7e5e4;
        }

        .footer-text {
            font-size: 7px;
            color: #a8a29e;
            letter-spacing: 0.5px;
        }

        .cert-number {
            font-weight: 600;
            color: #78716c;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- Decorative borders -->
        <div class="border-outer"></div>
        <div class="border-inner"></div>
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>
        <div class="accent-left"></div>
        <div class="accent-right"></div>

        <!-- QR Code - upper right -->
        <div class="qr-container">
            <img src="{{ $qrCode }}" alt="Verify">
            <div class="qr-label">Scan to Verify</div>
        </div>

        <div class="content">
            <!-- Header -->
            <div class="header">
                <div class="logo-row">
                    <span class="logo-icon">+</span>
                    <span class="logo-text">ClinicLink</span>
                </div>
                <div class="divider"></div>
                <div class="cert-title">Certificate</div>
                <div class="cert-subtitle">of Clinical Rotation Completion</div>
            </div>

            <!-- Body -->
            <div class="body">
                <div class="presented-to">This is to certify that</div>
                <div class="student-name">{{ $certificate->student->first_name }} {{ $certificate->student->last_name }}</div>

                <div class="description">
                    has successfully completed the <strong>{{ $certificate->slot->specialty }}</strong> clinical rotation
                    at <strong>{{ $certificate->slot->site->name }}</strong>,
                    fulfilling all requirements for the rotation titled
                    &ldquo;<strong>{{ $certificate->title }}</strong>.&rdquo;
                </div>

                <!-- Details -->
                <table class="details-grid">
                    <tr>
                        <td class="detail-item">
                            <div class="detail-label">Specialty</div>
                            <div class="detail-value">{{ $certificate->slot->specialty }}</div>
                        </td>
                        <td class="detail-item">
                            <div class="detail-label">Clinical Site</div>
                            <div class="detail-value">{{ $certificate->slot->site->name }}</div>
                        </td>
                        <td class="detail-item">
                            <div class="detail-label">Preceptor</div>
                            <div class="detail-value">{{ $certificate->slot->preceptor ? $certificate->slot->preceptor->first_name . ' ' . $certificate->slot->preceptor->last_name : 'N/A' }}</div>
                        </td>
                    </tr>
                    <tr>
                        <td class="detail-item">
                            <div class="detail-label">Rotation Period</div>
                            <div class="detail-value">{{ $certificate->slot->start_date->format('M d, Y') }} &ndash; {{ $certificate->slot->end_date->format('M d, Y') }}</div>
                        </td>
                        <td class="detail-item">
                            <div class="detail-label">Total Hours</div>
                            <div class="detail-value">{{ number_format($certificate->total_hours, 1) }} hours</div>
                        </td>
                        <td class="detail-item">
                            <div class="detail-label">Evaluation Score</div>
                            <div class="detail-value">{{ $certificate->overall_score ? number_format($certificate->overall_score, 1) . ' / 5.0' : 'N/A' }}</div>
                        </td>
                    </tr>
                </table>

                @if($university || $program)
                <div class="university-info">
                    @if($university && $program)
                        {{ $university->name }} &bull; {{ $program->name }}
                    @elseif($university)
                        {{ $university->name }}
                    @elseif($program)
                        {{ $program->name }}
                    @endif
                </div>
                @endif

                <!-- Signatures -->
                <table class="signatures">
                    <tr>
                        <td class="sig-block">
                            <div class="sig-line">
                                <div class="sig-name">{{ $certificate->slot->preceptor ? $certificate->slot->preceptor->first_name . ' ' . $certificate->slot->preceptor->last_name : '—' }}</div>
                                <div class="sig-title">Preceptor</div>
                            </div>
                        </td>
                        <td class="sig-block">
                            <div class="sig-line">
                                <div class="sig-name">{{ $certificate->slot->site->manager ? $certificate->slot->site->manager->first_name . ' ' . $certificate->slot->site->manager->last_name : '—' }}</div>
                                <div class="sig-title">Site Manager</div>
                            </div>
                        </td>
                        <td class="sig-block">
                            <div class="sig-line">
                                <div class="sig-name">{{ $certificate->issuer->first_name }} {{ $certificate->issuer->last_name }}</div>
                                <div class="sig-title">Issued By</div>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Certificate No. <span class="cert-number">{{ $certificate->certificate_number }}</span>
                &nbsp;&bull;&nbsp;
                Issued {{ $certificate->issued_date->format('F d, Y') }}
                &nbsp;&bull;&nbsp;
                Verify at {{ $verifyUrl }}
            </div>
        </div>
    </div>
</body>
</html>
