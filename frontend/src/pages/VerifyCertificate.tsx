import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { certificatesApi } from '../services/api.ts'
import { AlertTriangle, Stethoscope, CheckCircle, XCircle } from 'lucide-react'

export function VerifyCertificate() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-certificate', certificateNumber],
    queryFn: () => certificatesApi.publicVerify(certificateNumber!),
    enabled: !!certificateNumber,
  })

  const cert = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 via-stone-50 to-stone-100">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 print:hidden">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              ClinicLink
            </span>
          </Link>
          <span className="text-sm text-stone-500">Certificate Verification</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
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
          <div className="space-y-6">
            {/* Verification Status Banner */}
            <div className={`rounded-2xl p-4 flex items-center justify-center gap-3 ${
              cert.valid
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200'
                : 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200'
            }`}>
              {cert.valid ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className={`font-bold ${cert.valid ? 'text-green-800' : 'text-red-800'}`}>
                  {cert.valid ? 'Verified — This certificate is authentic and active' : 'Certificate Revoked'}
                </p>
                {!cert.valid && cert.revoked_date && (
                  <p className="text-sm text-red-600">Revoked on {new Date(cert.revoked_date).toLocaleDateString()}{cert.revocation_reason ? ` — ${cert.revocation_reason}` : ''}</p>
                )}
              </div>
            </div>

            {/* Visual Certificate */}
            <div className="relative bg-[#FAFAF8] rounded-2xl shadow-xl overflow-hidden">
              {/* Subtle diagonal pattern */}
              <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
                backgroundImage: 'repeating-linear-gradient(135deg, rgba(0,0,0,0.03), rgba(0,0,0,0.03) 2px, transparent 2px, transparent 16px)'
              }} />

              {/* Gold outer border */}
              <div className="absolute inset-4 md:inset-6 border-[3px] border-[#CFAF6E] rounded-2xl pointer-events-none" />

              {/* Navy inner border */}
              <div className="absolute inset-6 md:inset-8 border-[1.5px] border-[#0B3C5D] rounded-xl pointer-events-none" />

              {/* Corner ornaments */}
              <div className="absolute top-8 left-8 md:top-10 md:left-10 w-8 h-8 md:w-10 md:h-10 border-t-2 border-l-2 border-[#E5C98B] rounded-tl-3xl pointer-events-none" />
              <div className="absolute top-8 right-8 md:top-10 md:right-10 w-8 h-8 md:w-10 md:h-10 border-t-2 border-r-2 border-[#E5C98B] rounded-tr-3xl pointer-events-none" />
              <div className="absolute bottom-8 left-8 md:bottom-10 md:left-10 w-8 h-8 md:w-10 md:h-10 border-b-2 border-l-2 border-[#E5C98B] rounded-bl-3xl pointer-events-none" />
              <div className="absolute bottom-8 right-8 md:bottom-10 md:right-10 w-8 h-8 md:w-10 md:h-10 border-b-2 border-r-2 border-[#E5C98B] rounded-br-3xl pointer-events-none" />

              {/* Content — normal flow, not absolute */}
              <div className="relative z-10 px-10 py-10 md:px-16 md:py-12 flex flex-col items-center text-center">
                {/* Brand */}
                <p className="text-sm md:text-base font-bold text-[#0B3C5D] tracking-wider">ClinicLink</p>

                {/* Title */}
                <h1 className="font-serif text-3xl md:text-5xl tracking-[4px] md:tracking-[6px] text-[#0B3C5D] mt-2">CERTIFICATE</h1>
                <p className="text-[10px] md:text-xs uppercase tracking-[3px] md:tracking-[4px] text-stone-500 mt-1">of Clinical Rotation Completion</p>

                {/* Divider */}
                <div className="w-48 md:w-72 h-px bg-stone-300/50 my-4 md:my-5" />

                {/* Presented to */}
                <p className="text-[10px] md:text-[11px] uppercase tracking-[3px] text-stone-500">This is to certify that</p>

                {/* Student Name */}
                <p className="font-serif text-2xl md:text-4xl italic text-[#0B3C5D] mt-2">{cert.student_name}</p>

                {/* Description */}
                <p className="text-[11px] md:text-sm text-stone-600 leading-relaxed max-w-lg mt-3 md:mt-4">
                  has successfully completed the <strong className="text-stone-800">{cert.specialty}</strong> clinical rotation
                  at <strong className="text-stone-800">{cert.site_name}</strong>, fulfilling all requirements for the rotation titled
                  &ldquo;{cert.title}&rdquo;.
                </p>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mt-6 md:mt-8 w-full max-w-xl">
                  <div>
                    <p className="text-[8px] md:text-[9px] uppercase tracking-[2px] text-stone-400">Specialty</p>
                    <p className="text-xs md:text-sm font-bold text-stone-800 mt-1">{cert.specialty}</p>
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] uppercase tracking-[2px] text-stone-400">Clinical Site</p>
                    <p className="text-xs md:text-sm font-bold text-stone-800 mt-1">{cert.site_name}</p>
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] uppercase tracking-[2px] text-stone-400">Total Hours</p>
                    <p className="text-xs md:text-sm font-bold text-stone-800 mt-1">{cert.total_hours} hours</p>
                  </div>
                  <div>
                    <p className="text-[8px] md:text-[9px] uppercase tracking-[2px] text-stone-400">Evaluation</p>
                    <p className="text-xs md:text-sm font-bold text-stone-800 mt-1">{cert.overall_score ? `${cert.overall_score} / 5.0` : 'N/A'}</p>
                  </div>
                </div>

                {/* Verified Seal + Compliance */}
                <div className="flex items-center justify-center gap-4 mt-6 md:mt-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-[#CFAF6E] bg-[#CFAF6E]/10 flex items-center justify-center shrink-0">
                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border border-[#E5C98B] flex flex-col items-center justify-center">
                      <span className="text-[9px] md:text-[11px] font-extrabold tracking-[2px] text-[#0B3C5D]">VERIFIED</span>
                      <span className="text-[6px] md:text-[7px] tracking-[3px] text-stone-500 mt-0.5">CLINICLINK</span>
                    </div>
                  </div>
                  <p className="text-[9px] md:text-[10px] text-stone-400 text-left max-w-xs leading-relaxed">
                    Supervision was provided in accordance with applicable program and state requirements.
                    This certificate documents supervised clinical hours.
                  </p>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-6 md:gap-10 mt-6 md:mt-8 w-full max-w-lg">
                  {cert.preceptor_name && (
                    <div className="text-center">
                      <div className="border-t border-stone-300 pt-2 mx-1">
                        <p className="text-[10px] md:text-xs font-bold text-stone-800">{cert.preceptor_name}</p>
                        <p className="text-[7px] md:text-[9px] uppercase tracking-[1.5px] text-stone-400 mt-0.5">Preceptor</p>
                      </div>
                    </div>
                  )}
                  <div className="text-center">
                    <div className="border-t border-stone-300 pt-2 mx-1">
                      <p className="text-[10px] md:text-xs font-bold text-stone-800">{cert.issued_by}</p>
                      <p className="text-[7px] md:text-[9px] uppercase tracking-[1.5px] text-stone-400 mt-0.5">Issued By</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="border-t border-stone-300 pt-2 mx-1">
                      <p className="text-[10px] md:text-xs font-bold text-stone-800">ClinicLink</p>
                      <p className="text-[7px] md:text-[9px] uppercase tracking-[1.5px] text-stone-400 mt-0.5">Platform</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-6 md:mt-8 pt-4 border-t border-stone-200/50 w-full">
                  <p className="text-[8px] md:text-[9px] text-stone-400">
                    Certificate ID: <span className="font-semibold">{cert.certificate_number}</span>
                    &nbsp;&bull;&nbsp;
                    Issued: {new Date(cert.issued_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    &nbsp;&bull;&nbsp;
                    Verified: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-center gap-4 print:hidden">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#0B3C5D] text-white rounded-xl text-sm font-medium hover:bg-[#0B3C5D]/90 transition-colors"
              >
                Print Certificate
              </button>
              <Link
                to="/"
                className="px-5 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-sm font-medium hover:bg-stone-50 transition-colors"
              >
                Go to ClinicLink
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
