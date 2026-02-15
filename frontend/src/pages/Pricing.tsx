import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useSubscriptionCheckout, useSubscriptionStatus } from '../hooks/useApi.ts'
import {
  Check, ArrowRight, GraduationCap, Building2, BookOpen,
  Sparkles, Clock, RotateCcw, Percent
} from 'lucide-react'

interface Plan {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
  badge?: string
  action?: 'subscribe' | 'register' | 'contact' | 'none'
}

const STUDENT_PLANS: Plan[] = [
  {
    name: 'Free Trial',
    price: '$0',
    period: 'to start',
    description: '1 free rotation or 3 months — whichever comes first.',
    features: [
      '1 rotation placement included',
      '3-month trial period',
      'Search & apply to rotations',
      'Hour logging & tracking',
      'Evaluations & certificates',
      'Secure messaging',
      'Calendar & scheduling',
      'Compliance tracking',
    ],
    cta: 'Get Started Free',
    action: 'register',
  },
  {
    name: 'Pro',
    price: '$9.99',
    period: '/month',
    description: 'Unlimited rotations and premium features.',
    features: [
      'Unlimited rotation applications',
      'Everything in Free Trial',
      'Priority application badge',
      'Saved search alerts',
      'Advanced analytics & insights',
      'Preceptor matching AI',
      'Priority support',
    ],
    highlighted: true,
    cta: 'Upgrade to Pro',
    badge: 'Best Value',
    action: 'subscribe',
  },
]

const SITE_PLANS: Plan[] = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'List your site and accept students. Free rotations at no cost, paid rotations with a small platform fee.',
    features: [
      'Unlimited rotation listings',
      'Free rotations — no charge ever',
      'Paid rotations — 10% platform fee',
      'Application management',
      'Student hour review & approval',
      'Evaluation tools',
      'Onboarding checklists',
      'Secure messaging',
      'Stripe payouts for paid rotations',
      'Compliance tracking',
    ],
    cta: 'List Your Site Free',
    action: 'register',
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
    action: 'register',
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
    badge: 'Custom',
    action: 'contact',
  },
]

function PlanCard({ plan, onSubscribe, subscribing }: {
  plan: Plan
  onSubscribe?: (interval: 'month' | 'year') => void
  subscribing?: boolean
}) {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()

  const handleClick = () => {
    if (plan.action === 'none') return
    if (plan.action === 'contact') {
      window.location.href = 'mailto:sales@cliniclink.health?subject=Enterprise%20Inquiry'
      return
    }
    if (plan.action === 'subscribe') {
      if (!isAuthenticated) {
        navigate('/register')
        return
      }
      onSubscribe?.('month')
      return
    }
    navigate(isAuthenticated ? '/dashboard' : '/register')
  }

  return (
    <div className={`relative rounded-2xl border p-6 sm:p-8 flex flex-col transition-all duration-300 ${
      plan.highlighted
        ? 'border-primary-300 bg-white shadow-lg shadow-primary-500/10 scale-[1.02]'
        : 'border-stone-200 bg-white hover:border-stone-300'
    }`}>
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-xs font-semibold">
            <Sparkles className="w-3 h-3" /> {plan.badge}
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
        onClick={handleClick}
        disabled={subscribing}
        className={`w-full py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
          plan.highlighted
            ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white hover:from-primary-600 hover:to-secondary-600 shadow-md hover:-translate-y-0.5'
            : plan.action === 'contact'
              ? 'bg-stone-900 text-white hover:bg-stone-800'
              : 'bg-stone-100 text-stone-900 hover:bg-stone-200'
        } ${subscribing ? 'opacity-50 cursor-wait' : ''}`}
      >
        {subscribing ? 'Redirecting to Stripe...' : plan.cta}
        {!subscribing && <ArrowRight className="w-4 h-4" />}
      </button>
    </div>
  )
}

export function Pricing() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const checkout = useSubscriptionCheckout()
  const { data: subStatus } = useSubscriptionStatus()

  const handleSubscribe = (interval: 'month' | 'year') => {
    checkout.mutate({ plan: 'pro', interval }, {
      onSuccess: (data) => {
        window.location.href = data.url
      },
    })
  }

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
          Start free. Only pay when you need more.
        </p>
      </section>

      {/* How it works banner */}
      <section className="px-4 sm:px-6 pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <Clock className="w-8 h-8 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-stone-900">3-Month Trial</p>
                <p className="text-xs text-stone-500">Students start with 3 months free</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
              <RotateCcw className="w-8 h-8 text-green-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-stone-900">1 Free Rotation</p>
                <p className="text-xs text-stone-500">Your first rotation is always free</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-50 border border-purple-100">
              <Percent className="w-8 h-8 text-purple-500 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-stone-900">10% Platform Fee</p>
                <p className="text-xs text-stone-500">Only on paid rotations for sites</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Active subscription status */}
      {isAuthenticated && user?.role === 'student' && subStatus && (
        <section className="px-4 sm:px-6 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className={`p-4 rounded-xl border ${
              subStatus.needs_upgrade
                ? 'bg-amber-50 border-amber-200'
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">
                    Your Plan: <span className="capitalize">{subStatus.plan}</span>
                  </p>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {subStatus.trial_active && subStatus.trial_days_remaining !== null
                      ? `${subStatus.trial_days_remaining} days left in trial`
                      : subStatus.needs_upgrade
                        ? 'Free trial ended — upgrade to continue applying'
                        : subStatus.plan === 'pro'
                          ? 'Active subscription'
                          : `${subStatus.free_rotations_used}/${subStatus.free_rotations_limit} free rotation used`
                    }
                  </p>
                </div>
                {subStatus.needs_upgrade && (
                  <button
                    onClick={() => handleSubscribe('month')}
                    disabled={checkout.isPending}
                    className="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-semibold hover:bg-primary-600 transition-colors"
                  >
                    {checkout.isPending ? 'Redirecting...' : 'Upgrade Now'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

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
            {STUDENT_PLANS.map(plan => (
              <PlanCard
                key={plan.name}
                plan={plan}
                onSubscribe={handleSubscribe}
                subscribing={checkout.isPending}
              />
            ))}
          </div>
        </div>
      </section>

      {/* For Clinical Sites & Preceptors */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 bg-white border-y border-stone-200">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900">For Clinical Sites & Preceptors</h2>
              <p className="text-sm text-stone-500">List rotations free — only pay a small fee on paid placements</p>
            </div>
          </div>
          <div className="max-w-lg mx-auto">
            {SITE_PLANS.map(plan => <PlanCard key={plan.name} plan={plan} />)}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-stone-500">
              Whether you're a large clinic or an independent preceptor, listing is always free.
              <br />
              ClinicLink only takes a 10% platform fee on paid rotation placements.
            </p>
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
                q: 'Is ClinicLink really free for students?',
                a: 'Yes! Every student gets 1 free rotation and a 3-month trial period (whichever comes first). After that, upgrade to Pro for $9.99/month for unlimited rotations.',
              },
              {
                q: 'How does the free trial work?',
                a: 'When you sign up as a student, you get 3 months of full access plus 1 free rotation placement. Once you\'ve used your free rotation or the 3 months are up, you\'ll need a Pro subscription to apply for more rotations.',
              },
              {
                q: 'Is listing a rotation site really free?',
                a: 'Absolutely. There\'s no subscription fee for clinical sites or preceptors. If you offer free rotations, you pay nothing. For paid rotations, ClinicLink takes a 10% platform fee — you keep 90%. Payouts happen via Stripe.',
              },
              {
                q: 'I\'m a solo preceptor, not a big clinic. Can I still use ClinicLink?',
                a: 'Yes! Whether you\'re an independent preceptor or a large clinic, you can list rotation slots for free. The platform works the same for everyone.',
              },
              {
                q: 'How does payment processing work for paid rotations?',
                a: 'Clinical sites connect their Stripe account via Stripe Connect. When a student pays for a rotation, ClinicLink processes the payment and transfers 90% directly to the site. The 10% platform fee covers payment processing, compliance, and platform maintenance.',
              },
              {
                q: 'Is there a discount for annual billing?',
                a: 'Yes! The Pro plan is $9.99/month or $86/year (save 28% with annual billing).',
              },
              {
                q: 'What does the university Enterprise plan include?',
                a: 'Enterprise includes unlimited students and programs, accreditation reporting, SSO integration, and a dedicated account manager. Contact us for custom pricing based on your institution\'s needs.',
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
