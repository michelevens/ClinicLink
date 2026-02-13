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

        /* ── Navy inner border (aligned with learner cert) */
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
            top: 4.55in;
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

        /* [1] Title Block — CE-Specific */
        .cert-title {
            font-family: Georgia, 'Times New Roman', Times, serif;
            font-size: 40px;
            letter-spacing: 4px;
            color: #0B3C5D;
            margin-top: 4px;
        }

        .cert-subtitle {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 4px;
            color: #6B7280;
            margin-top: 2px;
        }

        .divider {
            width: 64%;
            height: 1px;
            background: rgba(0,0,0,0.08);
            margin: 10px auto;
        }

        /* ── Body ──────────────────────────────────────── */
        .presented-to {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #6B7280;
        }

        /* [2] Preceptor Identity with Credentials */
        .preceptor-name {
            font-family: Georgia, 'Times New Roman', Times, serif;
            font-size: 36px;
            font-style: italic;
            color: #0B3C5D;
            margin-top: 4px;
            margin-bottom: 2px;
        }

        /* [4] Contact Hours — HIGH VISIBILITY */
        .hours-block {
            margin: 6px auto 4px;
        }

        .hours-label {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #6B7280;
        }

        .hours-value {
            font-family: Georgia, 'Times New Roman', Times, serif;
            font-size: 28px;
            font-weight: 800;
            color: #0B3C5D;
            margin-top: 2px;
        }

        /* [3] CE Award Statement */
        .ce-statement {
            font-size: 11px;
            color: #333333;
            line-height: 1.5;
            max-width: 7.5in;
            margin: 6px auto 4px;
        }

        /* [8] Completion Criteria */
        .criteria-statement {
            font-size: 10px;
            color: #78716c;
            line-height: 1.4;
            max-width: 7.5in;
            margin: 2px auto 0.08in;
        }

        /* ── Details grid ──────────────────────────────── */
        .details-grid {
            width: 92%;
            margin: 0 auto 0.06in;
            border-collapse: separate;
            border-spacing: 14px 4px;
        }

        .detail-item {
            text-align: center;
            padding: 3px 6px;
        }

        .detail-label {
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 2px;
            color: #6B7280;
            margin-bottom: 2px;
        }

        .detail-value {
            font-size: 14px;
            font-weight: 700;
            color: #2F2F2F;
            margin-top: 2px;
        }

        /* ── Signatures ────────────────────────────────── */
        .signatures {
            position: absolute;
            bottom: 1.00in;
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
            padding-top: 5px;
            margin: 0 12px;
        }

        .sig-name {
            font-size: 12px;
            font-weight: 700;
            color: #2F2F2F;
        }

        .sig-title {
            font-size: 9px;
            color: #6B7280;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-top: 2px;
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
            font-size: 9px;
            color: #6B7280;
        }

        .cert-number {
            font-weight: 600;
        }

        /* [9] Platform Clarifier */
        .platform-clarifier {
            font-size: 8px;
            color: #a8a29e;
            margin-top: 3px;
        }
    </style>
</head>
<body>
    @php
        // Safe data extraction with nullsafe operators
        $preceptorName = $preceptorDisplay ?? (($certificate->preceptor->first_name ?? '') . ' ' . ($certificate->preceptor->last_name ?? ''));
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
        $accreditingBody = $policy?->accrediting_body;
        $activityTitle = 'Clinical Preceptorship' . ($specialty !== 'Clinical' ? ' — ' . $specialty . ' Rotation' : '');
        $locationDisplay = ($site?->city ?? '') . ($site?->city && $site?->state ? ', ' : '') . ($site?->state ?? '');
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

        {{-- [11] QR Code — upper right --}}
        <div class="qr-container">
            <div class="qr-box">
                <img src="{{ $qrCode }}" alt="Verify">
            </div>
            <div class="qr-label">Scan to Verify</div>
        </div>

        <!-- Verified Seal -->
        <div class="seal">
            <div class="seal-inner">
                <div class="seal-text">VERIFIED</div>
                <div class="seal-brand">CLINICLINK</div>
            </div>
        </div>

        <!-- Content -->
        <div class="content">
            <div class="brand">ClinicLink</div>

            {{-- [1] Title Block — CE-Specific --}}
            <div class="cert-title">CONTINUING EDUCATION</div>
            <div class="cert-subtitle">Preceptor CE Credit</div>

            <div class="divider"></div>

            <div class="presented-to">This is to certify that</div>

            {{-- [2] Preceptor Identity with Credentials --}}
            <div class="preceptor-name">{{ $preceptorName }}</div>

            {{-- [4] Contact Hours — HIGH VISIBILITY --}}
            <div class="hours-block">
                <div class="hours-label">Awarded Contact Hours</div>
                <div class="hours-value">{{ number_format($certificate->contact_hours, 2) }}</div>
            </div>

            {{-- [3] CE Award Statement --}}
            <div class="ce-statement">
                This certificate verifies that the preceptor named above has met the requirements for
                continuing education credit associated with clinical precepting activities.
            </div>

            {{-- [8] Completion Criteria --}}
            <div class="criteria-statement">
                Credit is awarded upon completion of the issuing organization&rsquo;s requirements for this activity.
            </div>

            {{-- [5] Activity / Rotation Information + [6] Accrediting Body + [7] Provider --}}
            <table class="details-grid">
                <tr>
                    <td class="detail-item">
                        <div class="detail-label">Activity Title</div>
                        <div class="detail-value">{{ $activityTitle }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Clinical Site</div>
                        <div class="detail-value">{{ $siteName }}</div>
                    </td>
                    <td class="detail-item">
                        <div class="detail-label">Activity Dates</div>
                        <div class="detail-value">{{ $startDateFormatted }} &ndash; {{ $endDateFormatted }}</div>
                    </td>
                </tr>
            </table>

            <table class="details-grid">
                <tr>
                    {{-- [7] Provider / Issuer --}}
                    <td class="detail-item" style="width: 40%;">
                        <div class="detail-label">Provider</div>
                        <div class="detail-value">{{ $universityName }}</div>
                    </td>
                    {{-- [6] Accrediting Body --}}
                    <td class="detail-item" style="width: 30%;">
                        <div class="detail-label">Accrediting Body</div>
                        <div class="detail-value">{{ $accreditingBody ?? 'N/A' }}</div>
                    </td>
                    {{-- Location of Activity --}}
                    <td class="detail-item" style="width: 30%;">
                        <div class="detail-label">Location</div>
                        <div class="detail-value">{{ $locationDisplay ?: 'N/A' }}</div>
                    </td>
                </tr>
            </table>
        </div>

        {{-- [10] Signature Block --}}
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

        {{-- [11] Footer with verification + [9] Platform Clarifier --}}
        <div class="footer">
            <div class="footer-text">
                Certificate ID: <span class="cert-number">{{ $certificate->verification_uuid }}</span>
                &nbsp;&bull;&nbsp;
                Issued: {{ $issuedAt->format('F j, Y') }}
                &nbsp;&bull;&nbsp;
                Verify at: {{ $verifyUrl }}
            </div>
            {{-- [9] Ownership / Platform Clarifier --}}
            <div class="platform-clarifier">
                CE credit is issued by the organization named on this certificate. ClinicLink provides verification and recordkeeping.
            </div>
        </div>
    </div>
</body>
</html>
