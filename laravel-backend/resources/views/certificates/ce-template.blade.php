<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>CE Certificate - {{ $certificate->verification_uuid }}</title>
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

        /* ── Deep green inner border ───────────────────── */
        .border-inner {
            position: absolute;
            top: 0.57in;
            left: 0.57in;
            right: 0.57in;
            bottom: 0.57in;
            border: 1.5px solid #065f46;
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
            color: #065f46;
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
            color: #065f46;
            letter-spacing: 1px;
        }

        .cert-title {
            font-family: Georgia, 'Times New Roman', Times, serif;
            font-size: 48px;
            letter-spacing: 4px;
            color: #065f46;
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
            margin: 14px auto;
        }

        /* ── Body ──────────────────────────────────────── */
        .presented-to {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #6B7280;
        }

        .preceptor-name {
            font-family: Georgia, 'Times New Roman', Times, serif;
            font-size: 42px;
            font-style: italic;
            color: #065f46;
            margin-top: 6px;
            margin-bottom: 6px;
        }

        .description {
            font-size: 13px;
            color: #333333;
            line-height: 1.45;
            max-width: 7.5in;
            margin: 0 auto 0.2in;
        }

        .hours-highlight {
            font-size: 18px;
            font-weight: 800;
            color: #065f46;
        }

        /* ── Details grid ──────────────────────────────── */
        .details-grid {
            width: 92%;
            margin: 0 auto 0.08in;
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

        /* ── Accreditation ─────────────────────────────── */
        .accreditation-info {
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
            width: 70%;
            margin: 0 auto;
            border-collapse: separate;
            border-spacing: 40px 0;
        }

        .sig-block {
            text-align: center;
            width: 50%;
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
    @php
        $preceptorName = ($certificate->preceptor->first_name ?? '') . ' ' . ($certificate->preceptor->last_name ?? '');
        $slot = $certificate->application?->slot;
        $site = $slot?->site;
        $specialty = $slot?->specialty ?? 'Clinical';
        $siteName = $site?->name ?? 'N/A';
        $startDate = $slot?->start_date;
        $endDate = $slot?->end_date;
        $startDateFormatted = $startDate ? $startDate->format('M d, Y') : 'N/A';
        $endDateFormatted = $endDate ? $endDate->format('M d, Y') : 'N/A';
        $universityName = $certificate->university?->name ?? 'N/A';
        $issuedAt = $certificate->issued_at ?? now();
        $signerName = $policy?->signer_name ?? 'Program Director';
        $signerCredentials = $policy?->signer_credentials ?? 'Authorized Signatory';
    @endphp

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

            <div class="cert-title">CONTINUING EDUCATION</div>
            <div class="cert-subtitle">Certificate of Completion</div>

            <div class="divider"></div>

            <div class="presented-to">This is to certify that</div>

            <div class="preceptor-name">{{ $preceptorName }}</div>

            <div class="description">
                has been awarded <span class="hours-highlight">{{ number_format($certificate->contact_hours, 1) }} contact hours</span>
                of continuing education credit for serving as clinical preceptor
                for the {{ $specialty }} rotation
                at {{ $siteName }},
                during the period of
                {{ $startDateFormatted }} &ndash;
                {{ $endDateFormatted }}.
            </div>

            <!-- Details Row 1: 3 columns -->
            <table class="details-grid">
                <tr>
                    <td class="detail-item">
                        <div class="detail-label">Contact Hours</div>
                        <div class="detail-value">{{ number_format($certificate->contact_hours, 1) }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Clinical Site</div>
                        <div class="detail-value">{{ $siteName }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Specialty</div>
                        <div class="detail-value">{{ $specialty }}</div>
                    </td>
                </tr>
            </table>

            <!-- Details Row 2: 3 columns -->
            <table class="details-grid">
                <tr>
                    <td class="detail-item">
                        <div class="detail-label">Rotation Period</div>
                        <div class="detail-value">{{ $startDateFormatted }} - {{ $endDateFormatted }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Issuing Institution</div>
                        <div class="detail-value">{{ $universityName }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Issue Date</div>
                        <div class="detail-value">{{ $issuedAt->format('M d, Y') }}</div>
                    </td>
                </tr>
            </table>

            @if($policy?->accrediting_body)
            <div class="accreditation-info">
                Accredited by {{ $policy->accrediting_body }}
                &bull; {{ $universityName }}
            </div>
            @endif
        </div>

        <!-- Signatures -->
        <div class="signatures">
            <table class="sig-table">
                <tr>
                    <td class="sig-block">
                        <div class="sig-line">
                            <div class="sig-name">{{ $signerName }}</div>
                            <div class="sig-title">{{ $signerCredentials }}</div>
                        </div>
                    </td>
                    <td class="sig-block">
                        <div class="sig-line">
                            <div class="sig-name">ClinicLink Platform</div>
                            <div class="sig-title">Verification Authority</div>
                        </div>
                    </td>
                </tr>
            </table>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-text">
                Verification ID: <span class="cert-number">{{ $certificate->verification_uuid }}</span>
                &nbsp;&bull;&nbsp;
                Issued: {{ $issuedAt->format('F j, Y') }}
                &nbsp;&bull;&nbsp;
                Verify: {{ $verifyUrl }}
            </div>
        </div>
    </div>
</body>
</html>
