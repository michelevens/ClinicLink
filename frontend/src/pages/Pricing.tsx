import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import {
  Check, ArrowRight, Stethoscope, GraduationCap, Building2, BookOpen,
  Sparkles, Shield, Zap, Users
} from 'lucide-react'

interface Plan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

const STUDENT_PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Everything you need to find and manage rotations.',
    features: [
      'Search & apply to rotations',
      'Hour logging & tracking',
      'Evaluations & certificates',
      'Secure messaging',
      'Calendar & scheduling',
      'Compliance tracking',
      'Credential management',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'Advanced tools for competitive students.',
    features: [
      'Everything in Free',
      'Priority application badge',
      'Saved search alerts',
      'Advanced analytics & insights',
      'Resume builder & export',
      'Preceptor matching AI',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Coming Soon',
  },
]

const SITE_PLANS: Plan[] = [
  {
    name: 'Starter',
    price: '$0',
    period: 'forever',
    description: 'List your site and start accepting students.',
    features: [
      'Up to 5 rotation slots',
      'Application management',
      'Student hour review',
      'Evaluation tools',
      'Secure messaging',
      'Basic compliance tracking',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Professional',
    price: '$49',
    period: '/month',
    description: 'For growing clinical sites with multiple preceptors.',
    features: [
      'Unlimited rotation slots',
      'Stripe payment processing',
      'Multi-preceptor management',
      'Onboarding checklists',
      'Advanced compliance tools',
      'Analytics & reports',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Coming Soon',
  },
]

const UNIVERSITY_PLANS: Plan[] = [
  {
    name: 'Department',
    price: '$0',
    period: 'forever',
    description: 'Manage a single program and its students.',
    features: [
      'Up to 50 students',
      'Single program management',
      'Placement tracking',
      'Agreement management',
      'Basic evaluation templates',
      'Student compliance monitoring',
    ],
    cta: 'Get Started Free',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Full-scale solution for universities and health systems.',
    features: [
      'Unlimited students & programs',
      'Multi-program management',
      'Accreditation reporting',
      'Custom evaluation templates',
      'CE credit management',
      'Advanced analytics',
      'SSO integration',
      'Dedicated account manager',
    ],
    highlighted: true,
    cta: 'Contact Sales',
  },
]

function PlanCard({ plan }: { plan: Plan }) {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col transition-all duration-300 ${
      plan.highlighted
        ? 'border-primary-300 bg-white shadow-lg shadow-primary-500/10 scale-[1.02]'
        : 'border-stone-200 bg-white hover:border-stone-300'
    }`}>
      {plan.highlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-semibold">
            <Sparkles className="w-3 h-3" /> Most Popular
          </span>
        </div>
      )}

      <div className="mb-6">
        <h3 className="text-lg font-bold text-stone-900">{plan.name}</h3>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-3xl font-bold text-stone-900">{plan.price}</span>
          {plan.period && <span className="text-sm text-stone-500">{plan.period}</span>}
        </div>
        <p className="mt-2 text-sm text-stone-500">{plan.description}</p>
      </div>

      <ul className="space-y-3 flex-1 mb-8">
        {plan.features.map(feature => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.highlighted ? 'text-primary-500' : 'text-green-500'}`} />
            <span className="text-stone-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => {
          if (plan.cta === 'Coming Soon' || plan.cta === 'Contact Sales') return
          navigate(isAuthenticated ? '/dashboard' : '/register')
        }}
        disabled={plan.cta === 'Coming Soon'}
        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          plan.highlighted
            ? plan.cta === 'Coming Soon'
              ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-md hover:-translate-y-0.5'
            : plan.cta === 'Contact Sales'
              ? 'bg-stone-900 text-white hover:bg-stone-800'
              : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
        }`}
      >
        {plan.cta}
        {plan.cta !== 'Coming Soon' && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  )
}

export function Pricing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="pt-8 pb-12 sm:pt-12 sm:pb-16 px-4 sm:px-6 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-sm font-medium mb-4">
          Pricing
        </span>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-stone-900 mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto">
          Start free and scale as you grow. No hidden fees, no surprises.
        </p>
      </section>

      {/* For Students */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">For Students</h2>
              <p className="text-sm text-stone-500">Find rotations, track hours, earn certificates</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {STUDENT_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} />)}
          </div>
        </div>
      </section>

      {/* For Clinical Sites */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">For Clinical Sites</h2>
              <p className="text-sm text-stone-500">List rotations, manage students, accept payments</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {SITE_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} />)}
          </div>
        </div>
      </section>

      {/* For Universities */}
      <section className="py-8 sm:py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">For Universities</h2>
              <p className="text-sm text-stone-500">Manage programs, placements, and accreditation</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {UNIVERSITY_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} />)}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 bg-white border-t border-stone-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-stone-900 text-center mb-10">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {[
              {
                q: 'Is ClinicLink really free?',
                a: 'Yes! All core features are free for students, clinical sites, and universities. Premium plans unlock advanced features like analytics, AI matching, and priority support.',
              },
              {
                q: 'How does payment processing work?',
                a: 'Clinical sites can charge fees for rotation placements via Stripe Connect. ClinicLink handles all payment processing, compliance, and payouts. A small platform fee applies to each transaction.',
              },
              {
                q: 'Can I switch plans later?',
                a: 'Absolutely. You can upgrade or downgrade at any time. Your data is always preserved.',
              },
              {
                q: 'What does "Coming Soon" mean?',
                a: 'Premium plans are in development. Sign up for free today and you\'ll be the first to know when they launch — with early adopter pricing.',
              },
              {
                q: 'Is there a discount for annual billing?',
                a: 'Yes, annual plans will include a 20% discount when premium tiers launch.',
              },
            ].map(faq => (
              <div key={faq.q} className="p-5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors">
                <h3 className="font-semibold text-stone-900 text-sm mb-2">{faq.q}</h3>
                <p className="text-sm text-stone-600">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-br from-primary-600 to-secondary-500 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg text-white/80 mb-8">
            Create your free account in under a minute.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              className="inline-flex items-center justify-center font-medium rounded-xl px-7 py-3 text-base gap-2.5 bg-white text-primary-600 hover:bg-white/90 shadow-lg hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-auto"
              onClick={() => navigate('/register')}
            >
              Create Free Account <ArrowRight className="w-5 h-5" />
            </button>
            <button
              className="inline-flex items-center justify-center font-medium rounded-xl px-7 py-3 text-base gap-2.5 border-2 border-white/50 text-white hover:bg-white/10 transition-all duration-300 w-full sm:w-auto"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
