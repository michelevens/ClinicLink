import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Building2, MapPin, Phone, Globe, BookOpen, Users,
  GraduationCap, Handshake, Award, CheckCircle2, Loader2, Clock,
  AlertTriangle, TrendingUp, BarChart3
} from 'lucide-react'
import { useUniversity } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success', draft: 'default', pending_review: 'warning', expired: 'danger', terminated: 'danger',
  issued: 'success', pending: 'warning', approved: 'success', rejected: 'danger',
}
const DEGREE_COLORS: Record<string, string> = {
  BSN: 'bg-blue-100 text-blue-700', MSN: 'bg-purple-100 text-purple-700',
  DNP: 'bg-emerald-100 text-emerald-700', PhD: 'bg-rose-100 text-rose-700',
  'PA-C': 'bg-amber-100 text-amber-700', MD: 'bg-teal-100 text-teal-700',
}

export function UniversityDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: university, isLoading } = useUniversity(id!)

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  if (!university) {
    return (
      <div className="text-center py-24">
        <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-stone-900">University not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/universities')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Universities
        </Button>
      </div>
    )
  }

  const programs = university.programs || []
  const agreements = university.affiliation_agreements || []
  const studentProfiles = university.student_profiles || []
  const cePolicy = university.ce_policy
  const ceCertificates = university.ce_certificates || []
  const analytics = university.analytics

  return (
    <div className="space-y-6">
      {/* Breadcrumbs + Header */}
      <div>
        <Breadcrumbs items={[
          { label: 'Universities', path: '/universities' },
          { label: university.name },
        ]} />

        <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold text-stone-900">{university.name}</h1>
            {university.is_verified && <Badge variant="success"><CheckCircle2 className="w-3 h-3 mr-1" />Verified</Badge>}
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-stone-600">
            {university.city && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-stone-400" />
                {university.address ? `${university.address}, ` : ''}{university.city}, {university.state} {university.zip}
              </span>
            )}
            {university.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-stone-400" /> {university.phone}</span>}
            {university.website && (
              <a href={university.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary-600 hover:underline">
                <Globe className="w-4 h-4" /> Website
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { icon: <BookOpen className="w-5 h-5" />, label: 'Programs', value: programs.length, color: 'bg-primary-50 text-primary-600' },
          { icon: <Users className="w-5 h-5" />, label: 'Students', value: university.student_profiles_count ?? studentProfiles.length, color: 'bg-green-50 text-green-600' },
          { icon: <Handshake className="w-5 h-5" />, label: 'Agreements', value: agreements.length, color: 'bg-amber-50 text-amber-600' },
          { icon: <Award className="w-5 h-5" />, label: 'CE Certificates', value: ceCertificates.length, color: 'bg-secondary-50 text-secondary-600' },
          { icon: <GraduationCap className="w-5 h-5" />, label: 'CE Policy', value: cePolicy ? 'Active' : 'None', color: 'bg-stone-100 text-stone-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-stone-200 p-4 text-center">
            <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center mx-auto mb-2`}>{s.icon}</div>
            <p className="text-xl font-bold text-stone-900">{s.value}</p>
            <p className="text-xs text-stone-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Programs */}
      <Card>
        <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary-500" /> Programs ({programs.length})
        </h2>
        {programs.length === 0 ? (
          <p className="text-sm text-stone-400 py-4 text-center">No programs added yet</p>
        ) : (
          <div className="space-y-2">
            {programs.map(p => (
              <div key={p.id} className="p-4 bg-stone-50 rounded-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900">{p.name}</p>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${DEGREE_COLORS[p.degree_type] || 'bg-stone-100 text-stone-700'}`}>
                        {p.degree_type}
                      </span>
                      {!p.is_active && <Badge variant="default" size="sm">Inactive</Badge>}
                    </div>
                    {p.specialties?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {p.specialties.map(s => <Badge key={s} variant="default" size="sm">{s}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div className="text-right text-xs text-stone-500">
                    <Clock className="w-3 h-3 inline mr-0.5" />
                    {p.required_hours}h required
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Students */}
      {studentProfiles.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-500" /> Students ({studentProfiles.length})
          </h2>
          <div className="space-y-2">
            {studentProfiles.slice(0, 20).map(sp => (
              <div key={sp.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                    {sp.user?.first_name?.[0] || '?'}{sp.user?.last_name?.[0] || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-900">
                      {sp.user ? `${sp.user.first_name} ${sp.user.last_name}` : 'Unknown'}
                    </p>
                    <p className="text-xs text-stone-500">
                      {sp.program?.name || 'No program'} {sp.program?.degree_type ? `(${sp.program.degree_type})` : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs text-stone-500">
                  {sp.hours_completed ? `${sp.hours_completed}/${sp.hours_required || '?'}h` : ''}
                </div>
              </div>
            ))}
            {studentProfiles.length > 20 && (
              <p className="text-xs text-stone-400 text-center py-2">
                Showing 20 of {studentProfiles.length} students
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Affiliation Agreements */}
      {agreements.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-primary-500" /> Affiliation Agreements ({agreements.length})
          </h2>
          <div className="space-y-2">
            {agreements.map(a => (
              <div key={a.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">{a.site?.name || 'Unknown Site'}</p>
                  <p className="text-xs text-stone-500">
                    {a.start_date ? new Date(a.start_date).toLocaleDateString() : '?'} - {a.end_date ? new Date(a.end_date).toLocaleDateString() : '?'}
                  </p>
                </div>
                <Badge variant={STATUS_COLORS[a.status] || 'default'} size="sm">{a.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* CE Policy */}
      {cePolicy && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary-500" /> CE Policy
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Offers CE</p>
              <p className="text-sm font-medium text-stone-900">{cePolicy.offers_ce ? 'Yes' : 'No'}</p>
            </div>
            {cePolicy.accrediting_body && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-500 mb-1">Accrediting Body</p>
                <p className="text-sm font-medium text-stone-900">{cePolicy.accrediting_body}</p>
              </div>
            )}
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Hours Per Rotation</p>
              <p className="text-sm font-medium text-stone-900">{cePolicy.contact_hours_per_rotation}</p>
            </div>
            {cePolicy.signer_name && (
              <div className="bg-stone-50 rounded-xl p-3">
                <p className="text-xs text-stone-500 mb-1">Signer</p>
                <p className="text-sm font-medium text-stone-900">{cePolicy.signer_name}{cePolicy.signer_credentials ? `, ${cePolicy.signer_credentials}` : ''}</p>
              </div>
            )}
            <div className="bg-stone-50 rounded-xl p-3">
              <p className="text-xs text-stone-500 mb-1">Approval Required</p>
              <p className="text-sm font-medium text-stone-900">{cePolicy.approval_required ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </Card>
      )}

      {/* CE Certificates */}
      {ceCertificates.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-primary-500" /> CE Certificates ({ceCertificates.length})
          </h2>
          <div className="space-y-2">
            {ceCertificates.map(cert => (
              <div key={cert.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {cert.preceptor ? `${cert.preceptor.first_name} ${cert.preceptor.last_name}` : 'Unknown Preceptor'}
                  </p>
                  <p className="text-xs text-stone-500">{cert.contact_hours} contact hours</p>
                </div>
                <Badge variant={STATUS_COLORS[cert.status] || 'default'} size="sm">{cert.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Analytics: Program Performance */}
      {analytics?.program_performance && analytics.program_performance.length > 0 && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary-500" /> Program Performance
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-stone-500 border-b border-stone-100">
                  <th className="text-left py-2 pr-4 font-medium">Program</th>
                  <th className="text-right py-2 px-3 font-medium">Students</th>
                  <th className="text-left py-2 px-3 font-medium min-w-[140px]">Avg Hours Progress</th>
                  <th className="text-right py-2 pl-3 font-medium">Completion</th>
                </tr>
              </thead>
              <tbody>
                {analytics.program_performance.map(p => {
                  const pct = p.required_hours > 0 ? Math.min(100, (p.avg_hours_completed / p.required_hours) * 100) : 0
                  return (
                    <tr key={p.id} className="border-b border-stone-50">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-stone-900">{p.name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${DEGREE_COLORS[p.degree_type] || 'bg-stone-100 text-stone-700'}`}>
                            {p.degree_type}
                          </span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-3 text-stone-600">{p.student_count}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-stone-500 w-20 text-right">{p.avg_hours_completed}/{p.required_hours}h</span>
                        </div>
                      </td>
                      <td className="text-right py-3 pl-3">
                        <span className={`text-xs font-semibold ${p.completion_rate >= 50 ? 'text-green-600' : p.completion_rate >= 25 ? 'text-amber-600' : 'text-stone-500'}`}>
                          {p.completion_rate}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Analytics: Agreement Health */}
      {analytics?.agreement_summary && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-primary-500" /> Agreement Health
          </h2>
          {analytics.agreement_summary.expiring_soon > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <p className="text-xs text-amber-700 font-medium">
                {analytics.agreement_summary.expiring_soon} agreement{analytics.agreement_summary.expiring_soon !== 1 ? 's' : ''} expiring within 30 days
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Active', value: analytics.agreement_summary.active, color: 'text-green-600 bg-green-50' },
              { label: 'Pending', value: analytics.agreement_summary.pending, color: 'text-amber-600 bg-amber-50' },
              { label: 'Expiring Soon', value: analytics.agreement_summary.expiring_soon, color: 'text-orange-600 bg-orange-50' },
              { label: 'Expired', value: analytics.agreement_summary.expired, color: 'text-red-600 bg-red-50' },
            ].map(s => (
              <div key={s.label} className={`rounded-xl p-3 text-center ${s.color}`}>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Analytics: Student Overview */}
      {analytics?.student_overview && (
        <Card>
          <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" /> Student Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-stone-900">{analytics.student_overview.total_enrolled}</p>
              <p className="text-xs text-stone-500 mt-0.5">Total Enrolled</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-stone-900">{analytics.student_overview.avg_hours_progress}h</p>
              <p className="text-xs text-stone-500 mt-0.5">Avg Hours Completed</p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{analytics.student_overview.nearing_completion}</p>
              <p className="text-xs text-stone-500 mt-0.5">Nearing Completion (80%+)</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
