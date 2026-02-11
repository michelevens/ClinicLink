import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ceCertificatesApi } from '../services/api.ts'
import { BadgeCheck, XCircle, Building2, Award, Calendar, MapPin, Stethoscope } from 'lucide-react'

export function VerifyCeCertificate() {
  const { uuid } = useParams<{ uuid: string }>()

  const { data, isLoading, error } = useQuery({
    queryKey: ['verify-ce', uuid],
    queryFn: () => ceCertificatesApi.publicVerify(uuid!),
    enabled: !!uuid,
  })

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-emerald-600 to-emerald-800 bg-clip-text text-transparent">
              ClinicLink
            </span>
          </div>
          <p className="text-sm text-stone-500 mt-1">CE Certificate Verification</p>
        </div>

        {isLoading && (
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-stone-500">Verifying certificate...</p>
          </div>
        )}

        {error && (
          <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-8 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Certificate Not Found</h2>
            <p className="text-stone-500">This verification link is invalid or the certificate does not exist.</p>
          </div>
        )}

        {data && (
          <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
            data.valid ? 'border-emerald-200' : 'border-red-200'
          }`}>
            {/* Status Banner */}
            <div className={`px-6 py-4 flex items-center gap-3 ${
              data.valid ? 'bg-emerald-50' : 'bg-red-50'
            }`}>
              {data.valid ? (
                <>
                  <BadgeCheck className="w-8 h-8 text-emerald-600" />
                  <div>
                    <p className="font-bold text-emerald-800">Verified CE Certificate</p>
                    <p className="text-sm text-emerald-600">This certificate is authentic and valid</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="font-bold text-red-800">Invalid Certificate</p>
                    <p className="text-sm text-red-600">Status: {data.status}</p>
                  </div>
                </>
              )}
            </div>

            {/* Details */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Preceptor</p>
                <p className="text-lg font-semibold text-stone-900">{data.preceptor_name}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Contact Hours
                  </p>
                  <p className="text-lg font-bold text-emerald-600">{data.contact_hours}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> Institution
                  </p>
                  <p className="text-sm font-medium text-stone-900">{data.university_name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Clinical Site
                  </p>
                  <p className="text-sm font-medium text-stone-900">{data.site_name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Specialty</p>
                  <p className="text-sm font-medium text-stone-900">{data.specialty}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Rotation Period
                  </p>
                  <p className="text-sm text-stone-700">{data.rotation_period}</p>
                </div>
                {data.issued_at && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Issued</p>
                    <p className="text-sm text-stone-700">{new Date(data.issued_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-stone-100">
                <p className="text-xs text-stone-400 text-center">
                  Verification ID: {data.verification_uuid}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
