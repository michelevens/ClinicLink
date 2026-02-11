import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { certificatesApi } from '../services/api.ts'
import { Award, CheckCircle, XCircle, AlertTriangle, Calendar, Clock, Star, MapPin, User, Stethoscope } from 'lucide-react'

export function VerifyCertificate() {
  const { certificateNumber } = useParams<{ certificateNumber: string }>()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['verify-certificate', certificateNumber],
    queryFn: () => certificatesApi.publicVerify(certificateNumber!),
    enabled: !!certificateNumber,
  })

  const cert = data

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
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

      <div className="max-w-2xl mx-auto px-4 py-12">
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
              Please check the certificate number and try again.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-medium hover:bg-primary-600 transition-colors"
            >
              Go to ClinicLink
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Banner */}
            <div className={`rounded-2xl p-6 text-center ${
              cert.valid
                ? 'bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200'
                : 'bg-gradient-to-br from-red-50 to-orange-50 border border-red-200'
            }`}>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                cert.valid ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {cert.valid ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <XCircle className="w-8 h-8 text-red-600" />
                )}
              </div>
              <h1 className={`text-2xl font-bold mb-1 ${cert.valid ? 'text-green-800' : 'text-red-800'}`}>
                {cert.valid ? 'Valid Certificate' : 'Certificate Revoked'}
              </h1>
              <p className={`text-sm ${cert.valid ? 'text-green-600' : 'text-red-600'}`}>
                {cert.valid
                  ? 'This certificate has been verified as authentic and active.'
                  : `This certificate was revoked on ${cert.revoked_date ? new Date(cert.revoked_date).toLocaleDateString() : 'N/A'}.`
                }
              </p>
            </div>

            {/* Certificate Details */}
            <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-stone-100 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 text-white flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-lg font-bold text-stone-900">{cert.title}</h2>
                <p className="text-sm font-mono text-stone-500 mt-1">{cert.certificate_number}</p>
              </div>

              <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-50 text-primary-500 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Student</p>
                    <p className="text-sm font-semibold text-stone-900">{cert.student_name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary-50 text-secondary-500 flex items-center justify-center shrink-0">
                    <Stethoscope className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Specialty</p>
                    <p className="text-sm font-semibold text-stone-900">{cert.specialty}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
                    <MapPin className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Clinical Site</p>
                    <p className="text-sm font-semibold text-stone-900">{cert.site_name}</p>
                  </div>
                </div>

                {cert.preceptor_name && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                      <User className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Preceptor</p>
                      <p className="text-sm font-semibold text-stone-900">{cert.preceptor_name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                    <Clock className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Total Hours</p>
                    <p className="text-sm font-semibold text-stone-900">{cert.total_hours} hours</p>
                  </div>
                </div>

                {cert.overall_score && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center shrink-0">
                      <Star className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Evaluation Score</p>
                      <p className="text-sm font-semibold text-stone-900">{cert.overall_score} / 5.0</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
                    <Calendar className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Issued Date</p>
                    <p className="text-sm font-semibold text-stone-900">{new Date(cert.issued_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-500 flex items-center justify-center shrink-0">
                    <User className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 uppercase tracking-wider">Issued By</p>
                    <p className="text-sm font-semibold text-stone-900">{cert.issued_by}</p>
                  </div>
                </div>
              </div>

              {!cert.valid && cert.revocation_reason && (
                <div className="mx-6 mb-6 p-4 bg-red-50 rounded-xl border border-red-200">
                  <div className="flex items-center gap-2 text-red-700 mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <p className="text-sm font-semibold">Revocation Reason</p>
                  </div>
                  <p className="text-sm text-red-600">{cert.revocation_reason}</p>
                </div>
              )}
            </div>

            <p className="text-center text-xs text-stone-400">
              Verified by ClinicLink &bull; {new Date().toLocaleDateString()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
