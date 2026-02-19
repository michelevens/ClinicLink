import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { usePageTitle } from '../../hooks/usePageTitle.ts'
import {
  Users, Search, FileCheck, ShieldCheck, ArrowRight, Stethoscope, GraduationCap, FileText
} from 'lucide-react'
import { Button } from '../../components/ui/Button.tsx'

export default function CollaborateLanding() {
  usePageTitle('Collaborate')
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 md:p-12 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,...')] opacity-10" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <ShieldCheck className="w-4 h-4" /> Collaboration Oversight
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            ClinicLink Collaborate
          </h1>
          <p className="text-lg text-white/80 mb-6">
            Connecting NPs and PAs with supervising physicians for state-mandated collaborative practice. Compliance tracking, matching, and capacity management — all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            {user?.role === 'practitioner' && (
              <Button onClick={() => navigate('/collaborate/requests')} className="bg-white text-indigo-700 hover:bg-white/90 !rounded-xl">
                Create a Request <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            {user?.role === 'preceptor' && (
              <Button onClick={() => navigate('/collaborate/profile')} className="bg-white text-indigo-700 hover:bg-white/90 !rounded-xl">
                Set Up Your Profile <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={() => navigate('/collaborate/directory')} variant="outline" className="border-white/30 text-white hover:bg-white/10 !rounded-xl">
              Browse Physicians <Search className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: <GraduationCap className="w-6 h-6" />,
              title: 'NP/PA Creates Request',
              desc: 'Specify your state, specialty, practice model, and start date. Our matching engine finds compatible physicians.',
              color: 'from-blue-500 to-indigo-500',
              bg: 'bg-blue-50',
            },
            {
              icon: <Stethoscope className="w-6 h-6" />,
              title: 'Physician Reviews Match',
              desc: 'Supervising physicians review incoming match requests and accept or decline based on their capacity and preferences.',
              color: 'from-purple-500 to-pink-500',
              bg: 'bg-purple-50',
            },
            {
              icon: <FileCheck className="w-6 h-6" />,
              title: 'Collaboration Begins',
              desc: 'Once matched, track your collaboration with compliance tools, attestation logs, and audit-ready evidence.',
              color: 'from-emerald-500 to-teal-500',
              bg: 'bg-emerald-50',
            },
          ].map(step => (
            <div key={step.title} className="bg-white rounded-2xl border border-stone-200 p-6 hover:shadow-lg transition-all duration-300">
              <div className={`w-12 h-12 rounded-xl ${step.bg} flex items-center justify-center mb-4`}>
                <div className={`bg-gradient-to-br ${step.color} bg-clip-text text-transparent`}>
                  {step.icon}
                </div>
              </div>
              <h3 className="font-semibold text-stone-900 mb-2">{step.title}</h3>
              <p className="text-sm text-stone-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/collaborate/directory')}
          className="bg-white rounded-2xl border border-stone-200 p-6 text-left hover:shadow-lg hover:border-indigo-200 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Physician Directory</h3>
              <p className="text-sm text-stone-500">Search supervising physicians by state, specialty, and availability</p>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 ml-auto group-hover:text-indigo-600 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => navigate('/collaborate/matches')}
          className="bg-white rounded-2xl border border-stone-200 p-6 text-left hover:shadow-lg hover:border-purple-200 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">My Matches</h3>
              <p className="text-sm text-stone-500">View and manage your collaboration matches</p>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 ml-auto group-hover:text-purple-600 transition-colors" />
          </div>
        </button>

        <button
          onClick={() => navigate('/collaborate/agreements')}
          className="bg-white rounded-2xl border border-stone-200 p-6 text-left hover:shadow-lg hover:border-emerald-200 transition-all duration-300 group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">Agreements</h3>
              <p className="text-sm text-stone-500">Manage active supervision agreements and billing</p>
            </div>
            <ArrowRight className="w-5 h-5 text-stone-400 ml-auto group-hover:text-emerald-600 transition-colors" />
          </div>
        </button>
      </div>
    </div>
  )
}
