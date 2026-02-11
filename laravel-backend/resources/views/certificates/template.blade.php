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
        }

        .certificate {
            width: 100%;
            height: 100%;
            padding: 0.5in;
            position: relative;
        }

        /* Decorative border */
        .border-outer {
            position: absolute;
            top: 0.35in;
            left: 0.35in;
            right: 0.35in;
            bottom: 0.35in;
            border: 3px solid #0369a1;
            border-radius: 8px;
        }

        .border-inner {
            position: absolute;
            top: 0.42in;
            left: 0.42in;
            right: 0.42in;
            bottom: 0.42in;
            border: 1px solid #7dd3fc;
            border-radius: 6px;
        }

        /* Corner accents */
        .corner {
            position: absolute;
            width: 40px;
            height: 40px;
        }

        .corner-tl { top: 0.3in; left: 0.3in; border-top: 4px solid #0ea5e9; border-left: 4px solid #0ea5e9; border-radius: 4px 0 0 0; }
        .corner-tr { top: 0.3in; right: 0.3in; border-top: 4px solid #0ea5e9; border-right: 4px solid #0ea5e9; border-radius: 0 4px 0 0; }
        .corner-bl { bottom: 0.3in; left: 0.3in; border-bottom: 4px solid #0ea5e9; border-left: 4px solid #0ea5e9; border-radius: 0 0 0 4px; }
        .corner-br { bottom: 0.3in; right: 0.3in; border-bottom: 4px solid #0ea5e9; border-right: 4px solid #0ea5e9; border-radius: 0 0 4px 0; }

        .content {
            position: relative;
            z-index: 1;
            text-align: center;
            height: 100%;
            display: flex;
            flex-direction: column;
            padding: 0.15in 0.3in;
        }

        /* QR Code - top right */
        .qr-container {
            position: absolute;
            top: 0.55in;
            right: 0.6in;
            text-align: center;
            z-index: 2;
        }

        .qr-container img {
            width: 80px;
            height: 80px;
        }

        .qr-label {
            font-size: 6.5px;
            color: #78716c;
            margin-top: 3px;
            letter-spacing: 0.5px;
            text-transform: uppercase;
        }

        /* Header */
        .header {
            margin-bottom: 0.15in;
        }

        .logo-row {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 6px;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
            background: linear-gradient(135deg, #0ea5e9, #0369a1);
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
            color: white;
            font-size: 18px;
            font-weight: bold;
            vertical-align: middle;
        }

        .logo-text {
            font-size: 22px;
            font-weight: 700;
            background: linear-gradient(135deg, #0ea5e9, #0369a1);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            letter-spacing: 1px;
            vertical-align: middle;
        }

        .divider {
            width: 120px;
            height: 2px;
            background: linear-gradient(90deg, transparent, #0ea5e9, transparent);
            margin: 8px auto;
        }

        .cert-title {
            font-size: 28px;
            font-weight: 300;
            letter-spacing: 8px;
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

        /* Body */
        .body {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .presented-to {
            font-size: 11px;
            color: #78716c;
            letter-spacing: 3px;
            text-transform: uppercase;
            margin-bottom: 8px;
        }

        .student-name {
            font-size: 32px;
            font-weight: 600;
            color: #0c4a6e;
            margin-bottom: 6px;
            font-style: italic;
        }

        .description {
            font-size: 11px;
            color: #57534e;
            line-height: 1.7;
            max-width: 7in;
            margin: 0 auto 0.2in;
        }

        /* Details grid */
        .details-grid {
            display: table;
            width: 80%;
            margin: 0 auto 0.2in;
            border-collapse: separate;
            border-spacing: 16px 6px;
        }

        .details-row {
            display: table-row;
        }

        .detail-item {
            display: table-cell;
            text-align: center;
            padding: 6px 12px;
        }

        .detail-label {
            font-size: 7.5px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            color: #a8a29e;
            margin-bottom: 3px;
        }

        .detail-value {
            font-size: 11px;
            font-weight: 600;
            color: #1c1917;
        }

        /* University info */
        .university-info {
            font-size: 9.5px;
            color: #78716c;
            margin-bottom: 0.2in;
        }

        /* Signatures */
        .signatures {
            display: table;
            width: 85%;
            margin: 0 auto;
            border-collapse: separate;
            border-spacing: 40px 0;
        }

        .sig-row {
            display: table-row;
        }

        .sig-block {
            display: table-cell;
            text-align: center;
            width: 33.33%;
            vertical-align: bottom;
        }

        .sig-line {
            border-top: 1px solid #d6d3d1;
            padding-top: 6px;
            margin-top: 30px;
        }

        .sig-name {
            font-size: 10px;
            font-weight: 600;
            color: #1c1917;
        }

        .sig-title {
            font-size: 8px;
            color: #a8a29e;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-top: 2px;
        }

        /* Footer */
        .footer {
            text-align: center;
            padding-top: 8px;
            border-top: 1px solid #e7e5e4;
            margin-top: auto;
        }

        .footer-text {
            font-size: 7.5px;
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

        <!-- QR Code -->
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
                    "<strong>{{ $certificate->title }}</strong>."
                </div>

                <!-- Details -->
                <div class="details-grid">
                    <div class="details-row">
                        <div class="detail-item">
                            <div class="detail-label">Specialty</div>
                            <div class="detail-value">{{ $certificate->slot->specialty }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Clinical Site</div>
                            <div class="detail-value">{{ $certificate->slot->site->name }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Preceptor</div>
                            <div class="detail-value">{{ $certificate->slot->preceptor ? $certificate->slot->preceptor->first_name . ' ' . $certificate->slot->preceptor->last_name : 'N/A' }}</div>
                        </div>
                    </div>
                    <div class="details-row">
                        <div class="detail-item">
                            <div class="detail-label">Rotation Period</div>
                            <div class="detail-value">{{ $certificate->slot->start_date->format('M d, Y') }} &ndash; {{ $certificate->slot->end_date->format('M d, Y') }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Total Hours</div>
                            <div class="detail-value">{{ number_format($certificate->total_hours, 1) }} hours</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Evaluation Score</div>
                            <div class="detail-value">{{ $certificate->overall_score ? number_format($certificate->overall_score, 1) . ' / 5.0' : 'N/A' }}</div>
                        </div>
                    </div>
                </div>

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
                <div class="signatures">
                    <div class="sig-row">
                        <div class="sig-block">
                            <div class="sig-line">
                                <div class="sig-name">{{ $certificate->slot->preceptor ? $certificate->slot->preceptor->first_name . ' ' . $certificate->slot->preceptor->last_name : '—' }}</div>
                                <div class="sig-title">Preceptor</div>
                            </div>
                        </div>
                        <div class="sig-block">
                            <div class="sig-line">
                                <div class="sig-name">{{ $certificate->slot->site->manager ? $certificate->slot->site->manager->first_name . ' ' . $certificate->slot->site->manager->last_name : '—' }}</div>
                                <div class="sig-title">Site Manager</div>
                            </div>
                        </div>
                        <div class="sig-block">
                            <div class="sig-line">
                                <div class="sig-name">{{ $certificate->issuer->first_name }} {{ $certificate->issuer->last_name }}</div>
                                <div class="sig-title">Issued By</div>
                            </div>
                        </div>
                    </div>
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
    </div>
</body>
</html>
