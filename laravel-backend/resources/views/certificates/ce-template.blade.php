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

        * { margin: 0; padding: 0; box-sizing: border-box; }

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

        .border-outer {
            position: absolute;
            top: 0.35in; left: 0.35in; right: 0.35in; bottom: 0.35in;
            border: 3px solid #065f46;
            border-radius: 8px;
        }

        .border-inner {
            position: absolute;
            top: 0.42in; left: 0.42in; right: 0.42in; bottom: 0.42in;
            border: 1px solid #6ee7b7;
            border-radius: 6px;
        }

        .corner { position: absolute; width: 40px; height: 40px; }
        .corner-tl { top: 0.3in; left: 0.3in; border-top: 4px solid #10b981; border-left: 4px solid #10b981; border-radius: 4px 0 0 0; }
        .corner-tr { top: 0.3in; right: 0.3in; border-top: 4px solid #10b981; border-right: 4px solid #10b981; border-radius: 0 4px 0 0; }
        .corner-bl { bottom: 0.3in; left: 0.3in; border-bottom: 4px solid #10b981; border-left: 4px solid #10b981; border-radius: 0 0 0 4px; }
        .corner-br { bottom: 0.3in; right: 0.3in; border-bottom: 4px solid #10b981; border-right: 4px solid #10b981; border-radius: 0 0 4px 0; }

        .content {
            position: relative; z-index: 1; text-align: center;
            height: 100%; display: flex; flex-direction: column;
            padding: 0.15in 0.3in;
        }

        .qr-container {
            position: absolute; top: 0.55in; right: 0.6in;
            text-align: center; z-index: 2;
        }
        .qr-container img { width: 80px; height: 80px; }
        .qr-label {
            font-size: 6.5px; color: #78716c; margin-top: 3px;
            letter-spacing: 0.5px; text-transform: uppercase;
        }

        .header { margin-bottom: 0.15in; }
        .logo-row {
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 6px;
        }
        .logo-icon {
            width: 32px; height: 32px;
            background: linear-gradient(135deg, #10b981, #065f46);
            border-radius: 8px; display: inline-flex;
            align-items: center; justify-content: center;
            margin-right: 10px; color: white;
            font-size: 18px; font-weight: bold; vertical-align: middle;
        }
        .logo-text {
            font-size: 22px; font-weight: 700;
            background: linear-gradient(135deg, #10b981, #065f46);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            letter-spacing: 1px; vertical-align: middle;
        }

        .divider {
            width: 120px; height: 2px;
            background: linear-gradient(90deg, transparent, #10b981, transparent);
            margin: 8px auto;
        }

        .cert-title {
            font-size: 24px; font-weight: 300; letter-spacing: 6px;
            text-transform: uppercase; color: #065f46; margin-bottom: 2px;
        }
        .cert-subtitle {
            font-size: 11px; letter-spacing: 4px;
            text-transform: uppercase; color: #78716c;
        }

        .body {
            flex: 1; display: flex; flex-direction: column;
            justify-content: center;
        }
        .presented-to {
            font-size: 11px; color: #78716c; letter-spacing: 3px;
            text-transform: uppercase; margin-bottom: 8px;
        }
        .preceptor-name {
            font-size: 32px; font-weight: 600; color: #065f46;
            margin-bottom: 6px; font-style: italic;
        }
        .description {
            font-size: 11px; color: #57534e; line-height: 1.7;
            max-width: 7in; margin: 0 auto 0.2in;
        }

        .details-grid {
            display: table; width: 80%; margin: 0 auto 0.2in;
            border-collapse: separate; border-spacing: 16px 6px;
        }
        .details-row { display: table-row; }
        .detail-item { display: table-cell; text-align: center; padding: 6px 12px; }
        .detail-label {
            font-size: 7.5px; text-transform: uppercase;
            letter-spacing: 1.5px; color: #a8a29e; margin-bottom: 3px;
        }
        .detail-value { font-size: 11px; font-weight: 600; color: #1c1917; }

        .accreditation-info {
            font-size: 9.5px; color: #78716c; margin-bottom: 0.2in;
        }

        .signatures {
            display: table; width: 70%; margin: 0 auto;
            border-collapse: separate; border-spacing: 40px 0;
        }
        .sig-row { display: table-row; }
        .sig-block {
            display: table-cell; text-align: center;
            width: 50%; vertical-align: bottom;
        }
        .sig-line {
            border-top: 1px solid #d6d3d1; padding-top: 6px;
            margin-top: 30px;
        }
        .sig-name { font-size: 10px; font-weight: 600; color: #1c1917; }
        .sig-title {
            font-size: 8px; color: #a8a29e;
            text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;
        }

        .footer {
            text-align: center; padding-top: 8px;
            border-top: 1px solid #e7e5e4; margin-top: auto;
        }
        .footer-text { font-size: 7.5px; color: #a8a29e; letter-spacing: 0.5px; }
        .cert-number { font-weight: 600; color: #78716c; }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="border-outer"></div>
        <div class="border-inner"></div>
        <div class="corner corner-tl"></div>
        <div class="corner corner-tr"></div>
        <div class="corner corner-bl"></div>
        <div class="corner corner-br"></div>

        <div class="qr-container">
            <img src="{{ $qrCode }}" alt="Verify">
            <div class="qr-label">Scan to Verify</div>
        </div>

        <div class="content">
            <div class="header">
                <div class="logo-row">
                    <span class="logo-icon">+</span>
                    <span class="logo-text">ClinicLink</span>
                </div>
                <div class="divider"></div>
                <div class="cert-title">Continuing Education</div>
                <div class="cert-subtitle">Certificate of Completion</div>
            </div>

            <div class="body">
                <div class="presented-to">This is to certify that</div>
                <div class="preceptor-name">{{ $certificate->preceptor->first_name }} {{ $certificate->preceptor->last_name }}</div>

                <div class="description">
                    has been awarded <strong>{{ number_format($certificate->contact_hours, 2) }} contact hours</strong>
                    of continuing education credit for serving as clinical preceptor
                    for the <strong>{{ $certificate->application->slot->specialty }}</strong> rotation
                    at <strong>{{ $certificate->application->slot->site->name }}</strong>,
                    during the period of
                    {{ $certificate->application->slot->start_date->format('M d, Y') }} &ndash;
                    {{ $certificate->application->slot->end_date->format('M d, Y') }}.
                </div>

                <div class="details-grid">
                    <div class="details-row">
                        <div class="detail-item">
                            <div class="detail-label">Contact Hours</div>
                            <div class="detail-value">{{ number_format($certificate->contact_hours, 2) }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Clinical Site</div>
                            <div class="detail-value">{{ $certificate->application->slot->site->name }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Specialty</div>
                            <div class="detail-value">{{ $certificate->application->slot->specialty }}</div>
                        </div>
                    </div>
                    <div class="details-row">
                        <div class="detail-item">
                            <div class="detail-label">Rotation Period</div>
                            <div class="detail-value">{{ $certificate->application->slot->start_date->format('M d, Y') }} &ndash; {{ $certificate->application->slot->end_date->format('M d, Y') }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Issuing Institution</div>
                            <div class="detail-value">{{ $certificate->university->name }}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Issue Date</div>
                            <div class="detail-value">{{ ($certificate->issued_at ?? now())->format('M d, Y') }}</div>
                        </div>
                    </div>
                </div>

                @if($policy && $policy->accrediting_body)
                <div class="accreditation-info">
                    Accredited by {{ $policy->accrediting_body }}
                    &bull; {{ $certificate->university->name }}
                </div>
                @endif

                <div class="signatures">
                    <div class="sig-row">
                        <div class="sig-block">
                            <div class="sig-line">
                                <div class="sig-name">{{ $policy->signer_name ?? 'Program Director' }}</div>
                                <div class="sig-title">{{ $policy->signer_credentials ?? 'Authorized Signatory' }}</div>
                            </div>
                        </div>
                        <div class="sig-block">
                            <div class="sig-line">
                                <div class="sig-name">ClinicLink Platform</div>
                                <div class="sig-title">Verification Authority</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer">
                <div class="footer-text">
                    Verification ID: <span class="cert-number">{{ $certificate->verification_uuid }}</span>
                    &nbsp;&bull;&nbsp;
                    Issued {{ ($certificate->issued_at ?? now())->format('F d, Y') }}
                    &nbsp;&bull;&nbsp;
                    Verify at {{ $verifyUrl }}
                </div>
            </div>
        </div>
    </div>
</body>
</html>
