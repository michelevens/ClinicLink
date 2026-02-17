import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, Users, Clock, Award, BookOpen, MessageSquare,
  Loader2, UserSearch, Shield, CalendarDays, GraduationCap, CheckCircle2,
  Zap, Sparkles, Target, Heart, ShieldCheck
} from 'lucide-react'
import { useState } from 'react'
import { usePreceptorProfile, usePreceptorReviews, usePreceptorReviewStats } from '../hooks/useApi.ts'
import { Card } from '../components/ui/Card.tsx'
import { Breadcrumbs } from '../components/ui/Breadcrumbs.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'

const BADGE_INFO: Record<string, { label: string; color: string; icon: React.ReactNode; description: string }> = {
  mentor_bronze: { label: 'Bronze Mentor', color: 'bg-amber-100 text-amber-700', icon: <Award className="w-4 h-4" />, description: '5+ students mentored' },
  mentor_silver: { label: 'Silver Mentor', color: 'bg-stone-100 text-stone-600', icon: <Award className="w-4 h-4" />, description: '15+ students mentored' },
  mentor_gold: { label: 'Gold Mentor', color: 'bg-yellow-100 text-yellow-700', icon: <Award className="w-4 h-4" />, description: '30+ students mentored' },
  hours_100: { label: 'Century Supervisor', color: 'bg-blue-100 text-blue-700', icon: <Clock className="w-4 h-4" />, description: '100+ hours supervised' },
  hours_500: { label: 'Master Supervisor', color: 'bg-purple-100 text-purple-700', icon: <Clock className="w-4 h-4" />, description: '500+ hours supervised' },
  top_rated: { label: 'Top Rated', color: 'bg-green-100 text-green-700', icon: <Star className="w-4 h-4" />, description: '4.5+ avg with 5+ reviews' },
  quick_responder: { label: 'Quick Responder', color: 'bg-sky-100 text-sky-700', icon: <Zap className="w-4 h-4" />, description: '90%+ reviews within 48hrs' },
  multi_specialty: { label: 'Multi-Specialty', color: 'bg-pink-100 text-pink-700', icon: <Sparkles className="w-4 h-4" />, description: '3+ specialties' },
}

const CATEGORY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  teaching_quality: { label: 'Teaching Quality', icon: <BookOpen className="w-3.5 h-3.5" /> },
  communication: { label: 'Communication', icon: <MessageSquare className="w-3.5 h-3.5" /> },
  mentorship: { label: 'Mentorship', icon: <Heart className="w-3.5 h-3.5" /> },
  professionalism: { label: 'Professionalism', icon: <Shield className="w-3.5 h-3.5" /> },
  feedback_quality: { label: 'Feedback Quality', icon: <Target className="w-3.5 h-3.5" /> },
  availability: { label: 'Availability', icon: <CalendarDays className="w-3.5 h-3.5" /> },
  clinical_knowledge: { label: 'Clinical Knowledge', icon: <GraduationCap className="w-3.5 h-3.5" /> },
  support: { label: 'Support', icon: <Users className="w-3.5 h-3.5" /> },
}

export function PreceptorDetail() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [showAllReviews, setShowAllReviews] = useState(false)

  const { data: profileData, isLoading: profileLoading } = usePreceptorProfile(userId ?? null)
  const { data: reviews, isLoading: reviewsLoading } = usePreceptorReviews(userId ?? null)
  const { data: reviewStats } = usePreceptorReviewStats(userId ?? null)

  if (profileLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const profile = profileData?.profile
  if (!profile) {
    return (
      <div className="text-center py-24">
        <UserSearch className="w-12 h-12 text-stone-300 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-stone-900">Preceptor not found</h2>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/preceptor-directory')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
        </Button>
      </div>
    )
  }

  const user = profile.user
  const firstName = user?.first_name || ''
  const lastName = user?.last_name || ''
  const email = user?.email || ''
  const availColor = profile.availability_status === 'available' ? 'bg-green-500' : profile.availability_status === 'limited' ? 'bg-yellow-500' : 'bg-stone-400'
  const availLabel = profile.availability_status === 'available' ? 'Available' : profile.availability_status === 'limited' ? 'Limited Availability' : 'Unavailable'
  const avgRating = reviewStats?.average_score ?? profile.review_stats?.average_score ?? null
  const reviewCount = reviewStats?.review_count ?? profile.review_stats?.review_count ?? 0
  const categoryAverages = reviewStats?.category_averages ?? profile.review_stats?.category_averages ?? null
  const reviewList = reviews || []
  const visibleReviews = showAllReviews ? reviewList : reviewList.slice(0, 5)

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: 'Preceptor Directory', path: '/preceptor-directory' },
        { label: `${firstName} ${lastName}`.trim() || 'Preceptor' },
      ]} />

      {/* Profile Header */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-5">
          <div className="w-20 h-20 rounded-2xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl shrink-0">
            {firstName[0] || '?'}{lastName[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-stone-900">{firstName} {lastName}</h1>
              {profile.is_npi_verified && (
                <span className="flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-full text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" /> NPI Verified
                </span>
              )}
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                profile.availability_status === 'available' ? 'bg-green-100 text-green-700'
                : profile.availability_status === 'limited' ? 'bg-yellow-100 text-yellow-700'
                : 'bg-stone-100 text-stone-600'
              }`}>
                <span className={`w-2 h-2 rounded-full ${availColor}`} />
                {availLabel}
              </span>
            </div>

            {/* Rating */}
            {avgRating != null && (
              <div className="flex items-center gap-1.5 mt-1.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${avgRating >= i ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`} />
                ))}
                <span className="text-sm font-semibold text-stone-900 ml-1">{avgRating.toFixed(1)}</span>
                <span className="text-sm text-stone-500">({reviewCount} review{reviewCount !== 1 ? 's' : ''})</span>
              </div>
            )}

            {/* Specialties */}
            {profile.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {profile.specialties.map(s => (
                  <span key={s} className="px-2.5 py-1 bg-white/70 text-primary-700 rounded-full text-xs font-medium">{s}</span>
                ))}
              </div>
            )}

            {/* Quick stats */}
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-stone-600">
              {profile.years_experience != null && (
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-stone-400" />{profile.years_experience} years experience</span>
              )}
              <span className="flex items-center gap-1"><Users className="w-4 h-4 text-stone-400" />{profile.total_students_mentored} students mentored</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-stone-400" />{profile.total_hours_supervised}h supervised</span>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm text-stone-600 leading-relaxed">{profile.bio}</p>
        )}
      </div>

      {/* Main Content: 2-column on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Credentials */}
          {profile.credentials && profile.credentials.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary-500" /> Credentials
              </h2>
              <div className="space-y-2">
                {profile.credentials.map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-stone-900">{c.name}</p>
                      <p className="text-xs text-stone-500">{c.type}{c.issuer ? ` · ${c.issuer}` : ''}</p>
                    </div>
                    {c.year && <span className="text-xs text-stone-400">{c.year}</span>}
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Rating Breakdown */}
          {categoryAverages && Object.keys(categoryAverages).length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Star className="w-4 h-4 text-primary-500" /> Rating Breakdown
              </h2>
              <div className="space-y-3">
                {Object.entries(CATEGORY_LABELS).map(([key, { label, icon }]) => {
                  const value = categoryAverages[key]
                  if (value == null) return null
                  const pct = (value / 5) * 100
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <div className="flex items-center gap-2 w-40 shrink-0">
                        <span className="text-stone-400">{icon}</span>
                        <span className="text-xs text-stone-600">{label}</span>
                      </div>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-stone-700 w-8 text-right">{value.toFixed(1)}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Reviews */}
          <Card>
            <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary-500" /> Reviews ({reviewList.length})
            </h2>
            {reviewsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
              </div>
            ) : reviewList.length === 0 ? (
              <p className="text-sm text-stone-400 py-6 text-center">No reviews yet</p>
            ) : (
              <div className="space-y-3">
                {visibleReviews.map(review => (
                  <div key={review.id} className="p-4 bg-stone-50 rounded-xl">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {review.is_anonymous || !review.student ? (
                          <span className="text-sm font-medium text-stone-500">Anonymous</span>
                        ) : (
                          <span className="text-sm font-medium text-stone-900">
                            {review.student.first_name} {review.student.last_name}
                          </span>
                        )}
                        {review.slot?.site && (
                          <span className="text-xs text-stone-400">· {review.slot.site.name}</span>
                        )}
                      </div>
                      <span className="text-xs text-stone-400">{new Date(review.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mt-1.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${review.overall_score >= i ? 'text-yellow-400 fill-yellow-400' : 'text-stone-300'}`} />
                      ))}
                      <span className="text-xs text-stone-500 ml-1.5">{review.overall_score.toFixed(1)}</span>
                    </div>
                    {review.comments && (
                      <p className="text-sm text-stone-600 mt-2 leading-relaxed">{review.comments}</p>
                    )}
                  </div>
                ))}
                {reviewList.length > 5 && !showAllReviews && (
                  <button
                    onClick={() => setShowAllReviews(true)}
                    className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors"
                  >
                    Show all {reviewList.length} reviews
                  </button>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: 1/3 */}
        <div className="space-y-6">

          {/* Mentoring Stats */}
          <Card>
            <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary-500" /> Mentoring Stats
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <span className="text-xs text-stone-500">Students Mentored</span>
                <span className="text-sm font-bold text-stone-900">{profile.total_students_mentored}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <span className="text-xs text-stone-500">Hours Supervised</span>
                <span className="text-sm font-bold text-stone-900">{profile.total_hours_supervised}h</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                <span className="text-xs text-stone-500">Max Students</span>
                <span className="text-sm font-bold text-stone-900">{profile.max_students}</span>
              </div>
            </div>
          </Card>

          {/* NPI Verification */}
          {profile.npi_number && (
            <Card>
              <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-500" /> NPI Verification
              </h2>
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-stone-900">NPI #{profile.npi_number}</p>
                  <p className="text-xs text-stone-500">
                    {profile.is_npi_verified ? 'Verified against NPPES registry' : 'Pending verification'}
                  </p>
                </div>
                {profile.is_npi_verified && (
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                )}
              </div>
            </Card>
          )}

          {/* Badges & Achievements */}
          {profile.badges && profile.badges.length > 0 && (
            <Card>
              <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary-500" /> Badges & Achievements
              </h2>
              <div className="space-y-2">
                {profile.badges.map(b => {
                  const badge = BADGE_INFO[b]
                  if (!badge) return null
                  return (
                    <div key={b} className={`flex items-center gap-3 p-3 rounded-xl ${badge.color}`}>
                      {badge.icon}
                      <div>
                        <p className="text-xs font-semibold">{badge.label}</p>
                        <p className="text-[10px] opacity-70">{badge.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}

          {/* Teaching Philosophy */}
          {profile.teaching_philosophy && (
            <Card>
              <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" /> Teaching Philosophy
              </h2>
              <p className="text-sm text-stone-600 leading-relaxed">{profile.teaching_philosophy}</p>
            </Card>
          )}

          {/* Schedule & Availability */}
          {profile.preferred_schedule && (
            <Card>
              <h2 className="text-sm font-semibold text-stone-900 mb-3 flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-primary-500" /> Preferred Schedule
              </h2>
              <p className="text-sm text-stone-600">{profile.preferred_schedule}</p>
            </Card>
          )}

          {/* Send Message CTA */}
          <Card>
            <h2 className="text-sm font-semibold text-stone-900 mb-3">Get in Touch</h2>
            <p className="text-xs text-stone-500 mb-3">Interested in learning from this preceptor? Send them a message.</p>
            <Button
              className="w-full"
              onClick={() => navigate(`/messages?to=${userId}`)}
            >
              <MessageSquare className="w-4 h-4 mr-2" /> Send Message
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
