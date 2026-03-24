import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { certificatesApi } from '../services/api.ts'
import { AlertTriangle, Stethoscope, CheckCircle, XCircle, Printer } from 'lucide-react'

export function VerifyCertificate() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-certificate', certificateNumber],
    queryFn: () => certificatesApi.publicVerify(certificateNumber!),
    enabled: !!certificateNumber,
  })

  const cert = data

  return (
    <>
      <style>{`
        @media print {
          @page { size: 11in 8.5in landscape; margin: 0; }
          html, body { margin: 0; padding: 0; width: 11in; height: 8.5in; overflow: hidden; }
          .no-print { display: none !important; }
          .cert-canvas {
            position: fixed !important;
            top: 0; left: 0;
            width: 11in !important;
            height: 8.5in !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            max-width: none !important;
          }
        }

        .cert-canvas {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          background: #FAFAF8;
          position: relative;
          width: 100%;
          max-width: 1056px;
          aspect-ratio: 11 / 8.5;
          overflow: hidden;
          color: #1c1917;
        }

        /* Diagonal pattern */
        .cert-pattern {
          position: absolute; inset: 0;
          background-image: repeating-linear-gradient(135deg, rgba(0,0,0,0.03), rgba(0,0,0,0.03) 2px, transparent 2px, transparent 16px);
        }

        /* Gold outer border */
        .cert-border-outer {
          position: absolute;
          top: 4.1%; left: 4.1%; right: 4.1%; bottom: 4.1%;
          border: 3px solid #CFAF6E;
          border-radius: 18px;
        }

        /* Navy inner border */
        .cert-border-inner {
          position: absolute;
          top: 5.2%; left: 5.2%; right: 5.2%; bottom: 5.2%;
          border: 1.5px solid #0B3C5D;
          border-radius: 14px;
        }

        /* Corner ornaments */
        .cert-corner { position: absolute; width: 3.5%; aspect-ratio: 1; border: 2px solid #E5C98B; }
        .cert-corner-tl { top: 6.4%; left: 6.4%; border-right: 0; border-bottom: 0; border-radius: 40% 0 0 0; }
        .cert-corner-tr { top: 6.4%; right: 6.4%; border-left: 0; border-bottom: 0; border-radius: 0 40% 0 0; }
        .cert-corner-bl { bottom: 6.4%; left: 6.4%; border-right: 0; border-top: 0; border-radius: 0 0 0 40%; }
        .cert-corner-br { bottom: 6.4%; right: 6.4%; border-left: 0; border-top: 0; border-radius: 0 0 40% 0; }

        /* Seal - left side */
        .cert-seal {
          position: absolute;
          left: 8%; top: 54%;
          width: 9%; aspect-ratio: 1;
          border-radius: 50%;
          border: 2px solid #CFAF6E;
          background: rgba(207,175,110,0.15);
          display: flex; align-items: center; justify-content: center;
          z-index: 10;
        }
        .cert-seal-inner {
          width: 78%; aspect-ratio: 1;
          border-radius: 50%;
          border: 1px solid #E5C98B;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
        }
        .cert-seal-text { font-size: clamp(7px, 1vw, 12px); font-weight: 800; letter-spacing: 2px; color: #0B3C5D; }
        .cert-seal-brand { font-size: clamp(5px, 0.7vw, 9px); letter-spacing: 3px; color: #6B7280; margin-top: 2px; }

        /* Content area */
        .cert-content {
          position: absolute;
          top: 8%; left: 8%; right: 8%; bottom: 8%;
          text-align: center;
          display: flex; flex-direction: column; align-items: center;
          z-index: 5;
        }

        .cert-brand { font-size: clamp(11px, 1.3vw, 16px); font-weight: 700; color: #0B3C5D; letter-spacing: 1px; }

        .cert-title {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(24px, 4.5vw, 52px);
          letter-spacing: 6px; color: #0B3C5D; margin-top: 0.5%;
        }

        .cert-subtitle {
          font-size: clamp(8px, 1vw, 12px);
          text-transform: uppercase; letter-spacing: 4px; color: #6B7280; margin-top: 0.3%;
        }

        .cert-divider { width: 64%; height: 1px; background: rgba(0,0,0,0.08); margin: 1.5% auto; }

        .cert-presented { font-size: clamp(8px, 0.9vw, 11px); text-transform: uppercase; letter-spacing: 3px; color: #6B7280; }

        .cert-student {
          font-family: Georgia, 'Times New Roman', serif;
          font-size: clamp(20px, 3.5vw, 40px);
          font-style: italic; color: #0B3C5D; margin-top: 0.5%; margin-bottom: 0.3%;
        }

        .cert-description {
          font-size: clamp(9px, 1vw, 12px);
          color: #333; line-height: 1.45; max-width: 80%; margin: 0 auto 1.5%;
        }

        /* Details grid */
        .cert-details { width: 92%; margin: 0 auto 0.8%; display: flex; justify-content: center; gap: 2%; }
        .cert-detail { text-align: center; flex: 1; }
        .cert-detail-label { font-size: clamp(6px, 0.75vw, 9px); text-transform: uppercase; letter-spacing: 2px; color: #6B7280; margin-bottom: 2px; }
        .cert-detail-value { font-size: clamp(9px, 1.2vw, 14px); font-weight: 700; color: #2F2F2F; }

        /* Compliance */
        .cert-compliance { font-size: clamp(7px, 0.8vw, 9.5px); color: #78716c; line-height: 1.5; margin-top: 1%; }
        .cert-non-ce { font-size: clamp(6px, 0.7vw, 9px); color: #a8a29e; line-height: 1.5; margin-top: 0.3%; }

        /* Signatures */
        .cert-signatures {
          position: absolute; bottom: 10%; left: 8%; right: 8%;
          display: flex; justify-content: center; gap: 5%;
          z-index: 10;
        }
        .cert-sig { text-align: center; width: 28%; }
        .cert-sig-line { border-top: 1px solid rgba(0,0,0,0.15); padding-top: 5px; margin: 0 8%; }
        .cert-sig-name { font-size: clamp(8px, 1vw, 12px); font-weight: 700; color: #2F2F2F; }
        .cert-sig-title { font-size: clamp(6px, 0.7vw, 9px); color: #6B7280; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 2px; }

        /* Footer */
        .cert-footer {
          position: absolute; bottom: 6%; left: 8%; right: 8%;
          text-align: center; z-index: 10;
        }
        .cert-footer-text { font-size: clamp(6px, 0.75vw, 9px); color: #6B7280; }
        .cert-footer-text strong { font-weight: 600; }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
        {/* Header */}
        <div className="no-print bg-white border-b border-stone-200">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                ClinicLink
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-stone-500 hidden sm:block">Certificate Verification</span>
              {cert && cert.valid && (
                <button onClick={() => window.print()} className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B3C5D] text-white rounded-lg text-sm font-medium hover:bg-[#0B3C5D]/90 transition-colors">
                  <Printer className="w-4 h-4" /> Print / Save PDF
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Verification banner */}
        {cert && (
          <div className="no-print">
            <div className={`py-2.5 px-4 flex items-center justify-center gap-2 text-sm font-medium ${
              cert.valid ? 'bg-green-50 text-green-800 border-b border-green-200' : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}>
              {cert.valid ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {cert.valid ? 'Verified — This certificate is authentic and active' : `Certificate Revoked${cert.revoked_date ? ` on ${new Date(cert.revoked_date).toLocaleDateString()}` : ''}`}
            </div>
          </div>
        )}

        <div className="flex justify-center px-2 py-4 sm:py-6">
          {isLoading ? (
            <div className="flex flex-col items-center py-16">
              <div className="w-10 h-10 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-stone-500">Verifying certificate...</p>
            </div>
          ) : isError || !cert ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="w-10 h-10 text-stone-400" />
              </div>
              <h1 className="text-2xl font-bold text-stone-900 mb-2">Certificate Not Found</h1>
              <p className="text-stone-500 mb-6">No certificate found with number <span className="font-mono font-semibold">{certificateNumber}</span>.</p>
              <Link to="/" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">Go to ClinicLink</Link>
            </div>
          ) : (
            <div className="w-full max-w-5xl">
              {/* ===== THE CERTIFICATE — matches PDF template exactly ===== */}
              <div className="cert-canvas rounded-xl shadow-2xl mx-auto">
                <div className="cert-pattern" />
                <div className="cert-border-outer" />
                <div className="cert-border-inner" />
                <div className="cert-corner cert-corner-tl" />
                <div className="cert-corner cert-corner-tr" />
                <div className="cert-corner cert-corner-bl" />
                <div className="cert-corner cert-corner-br" />

                {/* Verified Seal — left side, matching PDF */}
                <div className="cert-seal">
                  <div className="cert-seal-inner">
                    <div className="cert-seal-text">VERIFIED</div>
                    <div className="cert-seal-brand">CLINICLINK</div>
                  </div>
                </div>

                {/* Content */}
                <div className="cert-content">
                  <div className="cert-brand">ClinicLink</div>
                  <div className="cert-title">CERTIFICATE</div>
                  <div className="cert-subtitle">of Clinical Rotation Completion</div>
                  <div className="cert-divider" />
                  <div className="cert-presented">This is to certify that</div>
                  <div className="cert-student">{cert.student_name}</div>

                  <div className="cert-description">
                    has successfully completed the {cert.specialty} clinical rotation
                    at {cert.site_name}, fulfilling all requirements for the rotation titled
                    &ldquo;{cert.title}&rdquo; &ndash; Completion Certificate.
                  </div>

                  {/* Details Row 1 */}
                  <div className="cert-details">
                    <div className="cert-detail">
                      <div className="cert-detail-label">Specialty</div>
                      <div className="cert-detail-value">{cert.specialty}</div>
                    </div>
                    <div className="cert-detail">
                      <div className="cert-detail-label">Clinical Site</div>
                      <div className="cert-detail-value">{cert.site_name}</div>
                    </div>
                    <div className="cert-detail">
                      <div className="cert-detail-label">Total Hours</div>
                      <div className="cert-detail-value">{cert.total_hours} hours</div>
                    </div>
                    <div className="cert-detail">
                      <div className="cert-detail-label">Evaluation Score</div>
                      <div className="cert-detail-value">{cert.overall_score ? `${cert.overall_score} / 5.0` : 'N/A'}</div>
                    </div>
                  </div>

                  {/* Details Row 2 */}
                  <div className="cert-details" style={{ width: '75%' }}>
                    {cert.preceptor_name && (
                      <div className="cert-detail" style={{ flex: 1.3 }}>
                        <div className="cert-detail-label">Preceptor</div>
                        <div className="cert-detail-value">{cert.preceptor_name}</div>
                      </div>
                    )}
                    <div className="cert-detail">
                      <div className="cert-detail-label">Issued By</div>
                      <div className="cert-detail-value">{cert.issued_by}</div>
                    </div>
                    <div className="cert-detail">
                      <div className="cert-detail-label">Issue Date</div>
                      <div className="cert-detail-value">{new Date(cert.issued_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                  </div>

                  {/* Compliance */}
                  <div className="cert-compliance">
                    Supervision was provided in accordance with applicable program and state requirements.
                  </div>
                  <div className="cert-non-ce">
                    This certificate documents supervised clinical hours and does not itself confer continuing education credit.
                  </div>
                </div>

                {/* Signatures — absolute bottom */}
                <div className="cert-signatures">
                  {cert.preceptor_name && (
                    <div className="cert-sig">
                      <div className="cert-sig-line">
                        <div className="cert-sig-name">{cert.preceptor_name}</div>
                        <div className="cert-sig-title">Preceptor</div>
                      </div>
                    </div>
                  )}
                  <div className="cert-sig">
                    <div className="cert-sig-line">
                      <div className="cert-sig-name">{cert.issued_by}</div>
                      <div className="cert-sig-title">Issued By</div>
                    </div>
                  </div>
                  <div className="cert-sig">
                    <div className="cert-sig-line">
                      <div className="cert-sig-name">ClinicLink</div>
                      <div className="cert-sig-title">Platform</div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="cert-footer">
                  <div className="cert-footer-text">
                    Certificate ID: <strong>{cert.certificate_number}</strong>
                    &nbsp;&bull;&nbsp;
                    Issued: {new Date(cert.issued_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    &nbsp;&bull;&nbsp;
                    Verify at: cliniclink.health/verify/{cert.certificate_number}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="no-print flex items-center justify-center gap-4 mt-6">
                <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3C5D] text-white rounded-xl text-sm font-medium hover:bg-[#0B3C5D]/90 transition-colors">
                  <Printer className="w-4 h-4" /> Print / Save as PDF
                </button>
                <Link to="/" className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors">
                  Go to ClinicLink
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
