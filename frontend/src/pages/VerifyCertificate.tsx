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
      {/* Print styles — landscape, full-page certificate, hide everything else */}
      <style>{`
        @media print {
          @page { size: landscape; margin: 0; }
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
          .print-certificate {
            position: fixed;
            top: 0; left: 0;
            width: 100vw;
            height: 100vh;
            border-radius: 0 !important;
            box-shadow: none !important;
            margin: 0 !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
        {/* Header — hidden on print */}
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
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0B3C5D] text-white rounded-lg text-sm font-medium hover:bg-[#0B3C5D]/90 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Verification banner — hidden on print */}
        {cert && (
          <div className="no-print">
            <div className={`py-3 px-4 flex items-center justify-center gap-2 text-sm font-medium ${
              cert.valid
                ? 'bg-green-50 text-green-800 border-b border-green-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}>
              {cert.valid ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {cert.valid ? 'Verified — This certificate is authentic and active' : `Certificate Revoked${cert.revoked_date ? ` on ${new Date(cert.revoked_date).toLocaleDateString()}` : ''}`}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6">
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
              <p className="text-stone-500 mb-6">
                No certificate was found with number <span className="font-mono font-semibold">{certificateNumber}</span>.
              </p>
              <Link to="/" className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors">
                Go to ClinicLink
              </Link>
            </div>
          ) : (
            <>
              {/* ============================================= */}
              {/*  THE CERTIFICATE — full width, landscape feel */}
              {/* ============================================= */}
              <div className="print-certificate relative bg-[#FAFAF8] rounded-xl shadow-2xl overflow-hidden" style={{ aspectRatio: '11/8.5' }}>
                {/* Subtle diagonal pattern */}
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.02), rgba(0,0,0,0.02) 2px, transparent 2px, transparent 16px)'
                }} />

                {/* Gold outer border */}
                <div className="absolute inset-[3.5%] border-[3px] border-[#CFAF6E] rounded-2xl pointer-events-none" />

                {/* Navy inner border */}
                <div className="absolute inset-[4.8%] border-[1.5px] border-[#0B3C5D] rounded-xl pointer-events-none" />

                {/* Corner ornaments */}
                <div className="absolute top-[6%] left-[6%] w-[3%] aspect-square border-t-2 border-l-2 border-[#E5C98B] rounded-tl-[40%] pointer-events-none" />
                <div className="absolute top-[6%] right-[6%] w-[3%] aspect-square border-t-2 border-r-2 border-[#E5C98B] rounded-tr-[40%] pointer-events-none" />
                <div className="absolute bottom-[6%] left-[6%] w-[3%] aspect-square border-b-2 border-l-2 border-[#E5C98B] rounded-bl-[40%] pointer-events-none" />
                <div className="absolute bottom-[6%] right-[6%] w-[3%] aspect-square border-b-2 border-r-2 border-[#E5C98B] rounded-br-[40%] pointer-events-none" />

                {/* QR / Seal — top right */}
                <div className="absolute top-[7%] right-[7%] z-20 flex flex-col items-center">
                  <div className="w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] rounded-full border-2 border-[#CFAF6E] bg-[#CFAF6E]/10 flex items-center justify-center">
                    <div className="w-[46px] h-[46px] sm:w-[62px] sm:h-[62px] rounded-full border border-[#E5C98B] flex flex-col items-center justify-center">
                      <span className="text-[8px] sm:text-[10px] font-extrabold tracking-[2px] text-[#0B3C5D]">VERIFIED</span>
                      <span className="text-[5px] sm:text-[7px] tracking-[2px] text-stone-500 mt-0.5">CLINICLINK</span>
                    </div>
                  </div>
                </div>

                {/* ── All content inside the borders ── */}
                <div className="absolute inset-[7%] flex flex-col items-center justify-between text-center z-10">

                  {/* TOP: Brand + Title */}
                  <div>
                    <p className="text-[11px] sm:text-sm md:text-base font-bold text-[#0B3C5D] tracking-[2px]">CLINICLINK</p>
                    <h1 className="font-serif text-[28px] sm:text-4xl md:text-[52px] tracking-[4px] sm:tracking-[6px] text-[#0B3C5D] mt-1 leading-tight">CERTIFICATE</h1>
                    <p className="text-[8px] sm:text-[10px] md:text-xs uppercase tracking-[3px] text-stone-500 mt-0.5">of Clinical Rotation Completion</p>
                    <div className="w-32 sm:w-48 md:w-64 h-px bg-black/10 mx-auto mt-2 sm:mt-3" />
                  </div>

                  {/* MIDDLE: Student + description */}
                  <div className="flex-1 flex flex-col items-center justify-center py-2">
                    <p className="text-[8px] sm:text-[10px] uppercase tracking-[3px] text-stone-500">This is to certify that</p>
                    <p className="font-serif text-xl sm:text-3xl md:text-[40px] italic text-[#0B3C5D] mt-1 leading-tight">{cert.student_name}</p>

                    <p className="text-[9px] sm:text-[11px] md:text-[13px] text-stone-600 leading-relaxed max-w-[80%] mt-2 sm:mt-3">
                      has successfully completed the <strong className="text-stone-800">{cert.specialty}</strong> clinical rotation
                      at <strong className="text-stone-800">{cert.site_name}</strong>, fulfilling all requirements
                      for &ldquo;{cert.title}&rdquo;.
                    </p>

                    {/* Details */}
                    <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-8 mt-3 sm:mt-5 w-[90%] max-w-2xl">
                      {[
                        { label: 'Specialty', value: cert.specialty },
                        { label: 'Clinical Site', value: cert.site_name },
                        { label: 'Total Hours', value: `${cert.total_hours} hours` },
                        { label: 'Evaluation', value: cert.overall_score ? `${cert.overall_score} / 5.0` : 'N/A' },
                      ].map(d => (
                        <div key={d.label}>
                          <p className="text-[6px] sm:text-[8px] md:text-[9px] uppercase tracking-[2px] text-stone-400">{d.label}</p>
                          <p className="text-[9px] sm:text-xs md:text-sm font-bold text-stone-800 mt-0.5 truncate">{d.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Row 2: Preceptor + Issued By + Date */}
                    <div className="grid grid-cols-3 gap-2 sm:gap-6 md:gap-10 mt-2 sm:mt-3 w-[75%] max-w-md">
                      {cert.preceptor_name && (
                        <div>
                          <p className="text-[6px] sm:text-[8px] md:text-[9px] uppercase tracking-[2px] text-stone-400">Preceptor</p>
                          <p className="text-[9px] sm:text-xs md:text-sm font-bold text-stone-800 mt-0.5">{cert.preceptor_name}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[6px] sm:text-[8px] md:text-[9px] uppercase tracking-[2px] text-stone-400">Issued By</p>
                        <p className="text-[9px] sm:text-xs md:text-sm font-bold text-stone-800 mt-0.5">{cert.issued_by}</p>
                      </div>
                      <div>
                        <p className="text-[6px] sm:text-[8px] md:text-[9px] uppercase tracking-[2px] text-stone-400">Issue Date</p>
                        <p className="text-[9px] sm:text-xs md:text-sm font-bold text-stone-800 mt-0.5">{new Date(cert.issued_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* BOTTOM: Compliance + Signatures + Footer */}
                  <div className="w-full">
                    {/* Compliance */}
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] text-stone-400 mb-2 sm:mb-3">
                      Supervision provided in accordance with applicable program and state requirements. This certificate documents supervised clinical hours.
                    </p>

                    {/* Signatures */}
                    <div className="grid grid-cols-3 gap-4 sm:gap-8 md:gap-12 w-[85%] max-w-lg mx-auto mb-3 sm:mb-4">
                      {cert.preceptor_name && (
                        <div className="text-center">
                          <div className="border-t border-stone-300/70 pt-1 sm:pt-1.5 mx-1">
                            <p className="text-[8px] sm:text-[10px] md:text-xs font-bold text-stone-800">{cert.preceptor_name}</p>
                            <p className="text-[6px] sm:text-[7px] md:text-[8px] uppercase tracking-[1.5px] text-stone-400">Preceptor</p>
                          </div>
                        </div>
                      )}
                      <div className="text-center">
                        <div className="border-t border-stone-300/70 pt-1 sm:pt-1.5 mx-1">
                          <p className="text-[8px] sm:text-[10px] md:text-xs font-bold text-stone-800">{cert.issued_by}</p>
                          <p className="text-[6px] sm:text-[7px] md:text-[8px] uppercase tracking-[1.5px] text-stone-400">Issued By</p>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="border-t border-stone-300/70 pt-1 sm:pt-1.5 mx-1">
                          <p className="text-[8px] sm:text-[10px] md:text-xs font-bold text-stone-800">ClinicLink</p>
                          <p className="text-[6px] sm:text-[7px] md:text-[8px] uppercase tracking-[1.5px] text-stone-400">Platform</p>
                        </div>
                      </div>
                    </div>

                    {/* Certificate ID footer */}
                    <p className="text-[7px] sm:text-[8px] md:text-[9px] text-stone-400">
                      Certificate ID: <span className="font-semibold">{cert.certificate_number}</span>
                      &nbsp;&middot;&nbsp;
                      Issued: {new Date(cert.issued_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      &nbsp;&middot;&nbsp;
                      Verify at cliniclink.health/verify/{cert.certificate_number}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions — hidden on print */}
              <div className="no-print flex items-center justify-center gap-4 mt-6">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0B3C5D] text-white rounded-xl text-sm font-medium hover:bg-[#0B3C5D]/90 transition-colors"
                >
                  <Printer className="w-4 h-4" /> Print Certificate
                </button>
                <Link
                  to="/"
                  className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
                >
                  Go to ClinicLink
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
