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
            background: #FAFAF8;
            overflow: hidden;
        }

        .certificate {
            width: 11in;
            height: 8.5in;
            position: relative;
            overflow: hidden;
        }

        /* ── Subtle diagonal pattern ───────────────────── */
        .pattern-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-image: repeating-linear-gradient(
                135deg,
                rgba(0,0,0,0.03),
                rgba(0,0,0,0.03) 2px,
                transparent 2px,
                transparent 16px
            );
            z-index: 0;
        }

        /* ── Gold outer border ─────────────────────────── */
        .border-outer {
            position: absolute;
            top: 0.45in;
            left: 0.45in;
            right: 0.45in;
            bottom: 0.45in;
            border: 3px solid #CFAF6E;
            border-radius: 18px;
            z-index: 1;
        }

        /* ── Navy inner border ─────────────────────────── */
        .border-inner {
            position: absolute;
            top: 0.57in;
            left: 0.57in;
            right: 0.57in;
            bottom: 0.57in;
            border: 1.5px solid #0B3C5D;
            border-radius: 14px;
            z-index: 1;
        }

        /* ── Corner ornaments ──────────────────────────── */
        .corner {
            position: absolute;
            width: 52px;
            height: 52px;
            border: 2px solid #E5C98B;
            z-index: 2;
        }

        .corner-tl {
            top: 0.70in;
            left: 0.70in;
            border-right: 0;
            border-bottom: 0;
            border-radius: 32px 0 0 0;
        }

        .corner-tr {
            top: 0.70in;
            right: 0.70in;
            border-left: 0;
            border-bottom: 0;
            border-radius: 0 32px 0 0;
        }

        .corner-bl {
            bottom: 0.70in;
            left: 0.70in;
            border-right: 0;
            border-top: 0;
            border-radius: 0 0 0 32px;
        }

        .corner-br {
            bottom: 0.70in;
            right: 0.70in;
            border-left: 0;
            border-top: 0;
            border-radius: 0 0 32px 0;
        }

        /* ── QR Code ─── upper right ──────────────────── */
        .qr-container {
            position: absolute;
            top: 0.90in;
            right: 0.90in;
            text-align: center;
            z-index: 10;
        }

        .qr-box {
            width: 0.95in;
            height: 0.95in;
            border-radius: 12px;
            border: 1px solid rgba(0,0,0,0.15);
            background: #ffffff;
            overflow: hidden;
        }

        .qr-container img {
            width: 0.95in;
            height: 0.95in;
        }

        .qr-label {
            font-size: 9px;
            color: #6B7280;
            margin-top: 4px;
            letter-spacing: 2px;
            text-transform: uppercase;
        }

        /* ── Verified seal ─────────────────────────────── */
        .seal {
            position: absolute;
            left: 1.00in;
            top: 4.65in;
            z-index: 10;
            width: 110px;
            height: 110px;
            border-radius: 50%;
            border: 2px solid #CFAF6E;
            background: rgba(207,175,110,0.15);
            text-align: center;
        }

        .seal-inner {
            width: 86px;
            height: 86px;
            border-radius: 50%;
            border: 1px solid #E5C98B;
            margin: 10px auto 0;
            padding-top: 26px;
        }

        .seal-text {
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 2px;
            color: #0B3C5D;
        }

        .seal-brand {
            font-size: 9px;
            letter-spacing: 3px;
            color: #6B7280;
            margin-top: 4px;
        }

        /* ── Content area ──────────────────────────────── */
        .content {
            position: absolute;
            top: 0.85in;
            left: 0.85in;
            right: 0.85in;
            bottom: 0.70in;
            text-align: center;
            z-index: 5;
        }

        /* ── Header ────────────────────────────────────── */
        .brand {
            font-size: 16px;
            font-weight: 700;
            color: #0B3C5D;
            letter-spacing: 1px;
        }

        .cert-title {
            font-family: Georgia, 'Times New Roman', Times, serif;
            font-size: 56px;
            letter-spacing: 6px;
            color: #0B3C5D;
            margin-top: 8px;
        }

        .cert-subtitle {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 4px;
            color: #6B7280;
            margin-top: 2px;
        }

        .divider {
            width: 64%;
            height: 1px;
            background: rgba(0,0,0,0.08);
            margin: 16px auto;
        }

        /* ── Body ──────────────────────────────────────── */
        .presented-to {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #6B7280;
        }

        .student-name {
            font-family: Georgia, 'Times New Roman', Times, serif;
            font-size: 42px;
            font-style: italic;
            color: #0B3C5D;
            margin-top: 6px;
            margin-bottom: 6px;
        }

        .description {
            font-size: 13px;
            color: #333333;
            line-height: 1.45;
            max-width: 7.5in;
            margin: 0 auto 0.25in;
        }

        /* ── Details grid ──────────────────────────────── */
        .details-grid {
            width: 92%;
            margin: 0 auto 0.12in;
            border-collapse: separate;
            border-spacing: 16px 6px;
        }

        .detail-item {
            text-align: center;
            padding: 4px 8px;
        }

        .detail-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #6B7280;
            margin-bottom: 3px;
        }

        .detail-value {
            font-size: 15px;
            font-weight: 700;
            color: #2F2F2F;
            margin-top: 3px;
        }

        /* ── University info ───────────────────────────── */
        .university-info {
            font-size: 10px;
            color: #6B7280;
            margin-bottom: 0.12in;
        }

        /* ── Signatures ────────────────────────────────── */
        .signatures {
            position: absolute;
            bottom: 1.05in;
            left: 0.85in;
            right: 0.85in;
            z-index: 10;
        }

        .sig-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 28px 0;
        }

        .sig-block {
            text-align: center;
            width: 33.33%;
            vertical-align: bottom;
        }

        .sig-line {
            border-top: 1px solid rgba(0,0,0,0.15);
            padding-top: 6px;
            margin: 0 12px;
        }

        .sig-name {
            font-size: 13px;
            font-weight: 700;
            color: #2F2F2F;
        }

        .sig-title {
            font-size: 10px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 3px;
        }

        /* ── Footer ────────────────────────────────────── */
        .footer {
            position: absolute;
            bottom: 0.62in;
            left: 0.85in;
            right: 0.85in;
            text-align: center;
            z-index: 10;
        }

        .footer-text {
            font-size: 10px;
            color: #6B7280;
        }

        .cert-number {
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <!-- Subtle diagonal pattern -->
        <div class="pattern-overlay"></div>

        <!-- Decorative borders -->
        <div class="border-outer"></div>
        <div class="border-inner"></div>

        <!-- Corner ornaments -->
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <!-- QR Code - upper right -->
        <div class="qr-container">
            <div class="qr-box">
                <img src="{{ $qrCode }}" alt="Verify">
            </div>
            <div class="qr-label">Scan to Verify</div>
        </div>

        <!-- Verified Seal - left side -->
        <div class="seal">
            <div class="seal-inner">
                <div class="seal-text">VERIFIED</div>
                <div class="seal-brand">CLINICLINK</div>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="brand">ClinicLink</div>

            <div class="cert-title">CERTIFICATE</div>
            <div class="cert-subtitle">of Clinical Rotation Completion</div>

            <div class="divider"></div>

            <div class="presented-to">This is to certify that</div>

            <div class="student-name">{{ $certificate->student->first_name }} {{ $certificate->student->last_name }}</div>

            <div class="description">
                has successfully completed the {{ $certificate->slot->specialty }} clinical rotation
                at {{ $certificate->slot->site->name }}, fulfilling all requirements for the rotation titled
                &ldquo;{{ $certificate->title }}&rdquo; &ndash; Completion Certificate.
            </div>

            <!-- Details Row 1: 4 columns -->
            <table class="details-grid">
                <tr>
                    <td class="detail-item">
                        <div class="detail-label">Specialty</div>
                        <div class="detail-value">{{ $certificate->slot->specialty }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Rotation Period</div>
                        <div class="detail-value">{{ $certificate->slot->start_date->format('M d, Y') }} - {{ $certificate->slot->end_date->format('M d, Y') }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Clinical Site</div>
                        <div class="detail-value">{{ $certificate->slot->site->name }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Total Hours</div>
                        <div class="detail-value">{{ number_format($certificate->total_hours, 0) }} hours</div>
                    </td>
                </tr>
            </table>

            <!-- Details Row 2: Preceptor + Evaluation Score -->
            <table class="details-grid" style="width: 66%;">
                <tr>
                    <td class="detail-item" style="width: 70%;">
                        <div class="detail-label">Preceptor</div>
                        <div class="detail-value">{{ $certificate->slot->preceptor ? $certificate->slot->preceptor->first_name . ' ' . $certificate->slot->preceptor->last_name : 'N/A' }}</div>
                    </td>
                    <td class="detail-item" style="width: 30%;">
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
        </div>

        <!-- Signatures -->
        <div class="signatures">
            <table class="sig-table">
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

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Certificate ID: <span class="cert-number">{{ $certificate->certificate_number }}</span>
                &nbsp;&bull;&nbsp;
                Issued: {{ $certificate->issued_date->format('F j, Y') }}
                &nbsp;&bull;&nbsp;
                Verify: {{ $verifyUrl }}
            </div>
        </div>
    </div>
</body>
</html>
