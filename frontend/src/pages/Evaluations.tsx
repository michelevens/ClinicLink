import { useState, useMemo } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useEvaluations, useCreateEvaluation, useApplications } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import type { ApiEvaluation } from '../services/api.ts'
import { toast } from 'sonner'
import {
  Star, Plus, ClipboardCheck, User, Calendar,
  Building2, Loader2, FileText, ChevronDown, ChevronUp,
  TrendingUp, Award, BarChart3, MessageSquare, Filter
} from 'lucide-react'

const RATING_CATEGORIES = [
  { key: 'clinical_knowledge', label: 'Clinical Knowledge' },
  { key: 'clinical_skills', label: 'Clinical Skills' },
  { key: 'professionalism', label: 'Professionalism' },
  { key: 'communication', label: 'Communication' },
  { key: 'critical_thinking', label: 'Critical Thinking' },
  { key: 'teamwork', label: 'Teamwork' },
  { key: 'time_management', label: 'Time Management' },
  { key: 'documentation', label: 'Documentation' },
]

type ViewTab = 'list' | 'summary'
type TypeFilter = 'all' | 'mid_rotation' | 'final' | 'student_feedback'

export function Evaluations() {
  const { user } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [viewTab, setViewTab] = useState<ViewTab>('list')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [form, setForm] = useState({
    type: 'student_feedback' as 'mid_rotation' | 'final' | 'student_feedback',
    student_id: '',
    slot_id: '',
    ratings: {} as Record<string, number>,
    comments: '',
    strengths: '',
    areas_for_improvement: '',
  })

  const { data, isLoading } = useEvaluations()
  const { data: appsData } = useApplications()
  const createMutation = useCreateEvaluation()

  const evaluations = data?.evaluations || []
  const acceptedApps = (appsData?.applications || []).filter(a => a.status === 'accepted')

  const isPreceptor = user?.role === 'preceptor'
  const isStudent = user?.role === 'student'

  // Filter evaluations
  const filteredEvals = typeFilter === 'all' ? evaluations : evaluations.filter(e => e.type === typeFilter)

  // Summary calculations
  const avgScore = useMemo(() => {
    if (evaluations.length === 0) return 0
    return Math.round((evaluations.reduce((sum, e) => sum + e.overall_score, 0) / evaluations.length) * 10) / 10
  }, [evaluations])

  const categoryAverages = useMemo(() => {
    const totals: Record<string, { sum: number; count: number }> = {}
    for (const e of evaluations) {
      for (const [key, value] of Object.entries(e.ratings)) {
        if (!totals[key]) totals[key] = { sum: 0, count: 0 }
        totals[key].sum += value as number
        totals[key].count += 1
      }
    }
    return Object.entries(totals)
      .map(([key, data]) => ({ key, label: key.replace(/_/g, ' '), avg: Math.round((data.sum / data.count) * 10) / 10 }))
      .sort((a, b) => b.avg - a.avg)
  }, [evaluations])

  const scoreTrend = useMemo(() => {
    return evaluations
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map(e => ({
        date: new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: e.overall_score,
        type: e.type,
      }))
  }, [evaluations])

  const setRating = (key: string, value: number) => {
    setForm(f => ({ ...f, ratings: { ...f.ratings, [key]: value } }))
  }

  const overallScore = () => {
    const values = Object.values(form.ratings)
    if (values.length === 0) return 0
    return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
  }

  const handleCreate = async () => {
    if (!form.slot_id) {
      toast.error('Please select a rotation')
      return
    }
    if (Object.keys(form.ratings).length < 3) {
      toast.error('Please rate at least 3 categories')
      return
    }
    if (!form.comments) {
      toast.error('Please add comments')
      return
    }
    try {
      await createMutation.mutateAsync({
        type: form.type,
        student_id: form.student_id || undefined,
        slot_id: form.slot_id,
        ratings: form.ratings,
        comments: form.comments,
        overall_score: overallScore(),
        strengths: form.strengths || null,
        areas_for_improvement: form.areas_for_improvement || null,
        is_submitted: true,
      })
      toast.success('Evaluation submitted successfully')
      setShowCreate(false)
      setForm({
        type: 'student_feedback',
        student_id: '',
        slot_id: '',
        ratings: {},
        comments: '',
        strengths: '',
        areas_for_improvement: '',
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to submit evaluation'
      toast.error(message)
    }
  }

  const renderStars = (score: number, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`${sizeClass} ${i <= Math.round(score) ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`}
          />
        ))}
      </div>
    )
  }

  const renderInteractiveStars = (category: string) => {
    const current = form.ratings[category] || 0
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            onClick={() => setRating(category, i)}
            className="focus:outline-none"
          >
            <Star
              className={`w-6 h-6 transition-colors ${
                i <= current ? 'text-amber-400 fill-amber-400' : 'text-stone-300 hover:text-amber-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'mid_rotation': return 'Mid-Rotation'
      case 'final': return 'Final'
      case 'student_feedback': return 'Site Feedback'
      default: return type
    }
  }

  const getTypeVariant = (type: string): 'primary' | 'secondary' | 'success' | 'warning' | 'default' => {
    switch (type) {
      case 'mid_rotation': return 'primary'
      case 'final': return 'success'
      case 'student_feedback': return 'secondary'
      default: return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Evaluations</h1>
          <p className="text-stone-500">
            {isPreceptor ? "Evaluate your students' performance" :
             isStudent ? 'View your evaluations and provide site feedback' :
             'Clinical evaluations overview'}
          </p>
        </div>
        {(isPreceptor || isStudent || user?.role === 'coordinator') && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> {isStudent ? 'Give Site Feedback' : 'New Evaluation'}
          </Button>
        )}
      </div>

      {/* Score Summary Banner */}
      {evaluations.length > 0 && (
        <Card className="bg-gradient-to-r from-amber-50 to-primary-50 border-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-amber-600" />
                <h3 className="font-semibold text-stone-900">Overall Performance</h3>
              </div>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-3xl font-bold text-amber-600">{avgScore}</span>
                <div>
                  {renderStars(avgScore, 'md')}
                  <p className="text-xs text-stone-500 mt-0.5">{evaluations.length} evaluation{evaluations.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-900">{evaluations.filter(e => e.type === 'mid_rotation').length}</p>
                <p className="text-xs text-stone-500">Mid-Rotation</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-900">{evaluations.filter(e => e.type === 'final').length}</p>
                <p className="text-xs text-stone-500">Final</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-900">{evaluations.filter(e => e.type === 'student_feedback').length}</p>
                <p className="text-xs text-stone-500">Feedback</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          { key: 'list' as ViewTab, label: 'Evaluations', icon: <ClipboardCheck className="w-4 h-4" /> },
          { key: 'summary' as ViewTab, label: 'Performance Summary', icon: <BarChart3 className="w-4 h-4" /> },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              viewTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* LIST VIEW */}
      {viewTab === 'list' && (
        <>
          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            {(['all', 'mid_rotation', 'final', 'student_feedback'] as TypeFilter[]).map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  typeFilter === t ? 'bg-primary-100 text-primary-700' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                }`}
              >
                {t === 'all' ? 'All' : getTypeLabel(t)}
              </button>
            ))}
          </div>

          {/* Evaluations List */}
          {filteredEvals.length === 0 && (
            <Card className="text-center py-12">
              <ClipboardCheck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-700 mb-2">
                {typeFilter === 'all' ? 'No evaluations yet' : `No ${getTypeLabel(typeFilter).toLowerCase()} evaluations`}
              </h3>
              <p className="text-stone-500">
                {isPreceptor ? 'Create your first evaluation for a student' :
                 isStudent ? 'Evaluations from your preceptors will appear here. You can also submit site feedback.' :
                 'No evaluations have been submitted'}
              </p>
            </Card>
          )}

          <div className="space-y-3">
            {filteredEvals.map(evalItem => {
              const isExpanded = expandedId === evalItem.id
              return (
                <Card key={evalItem.id} padding="none">
                  <div
                    className="p-4 sm:p-6 cursor-pointer hover:bg-stone-50/30 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : evalItem.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        evalItem.overall_score >= 4 ? 'bg-green-50 text-green-600' :
                        evalItem.overall_score >= 3 ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        <ClipboardCheck className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-stone-900">
                            {getTypeLabel(evalItem.type)} Evaluation
                          </h3>
                          <Badge variant={getTypeVariant(evalItem.type)} size="sm">
                            {getTypeLabel(evalItem.type)}
                          </Badge>
                          <Badge variant={evalItem.overall_score >= 4 ? 'success' : evalItem.overall_score >= 3 ? 'warning' : 'danger'}>
                            {evalItem.overall_score}/5
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-stone-500">
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5" />
                            {isStudent
                              ? `By ${evalItem.preceptor?.first_name || ''} ${evalItem.preceptor?.last_name || ''}`
                              : `${evalItem.student?.first_name || ''} ${evalItem.student?.last_name || ''}`}
                          </span>
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5" />
                            {evalItem.slot?.title || evalItem.slot?.specialty || 'Rotation'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(evalItem.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="mt-2">
                          {renderStars(evalItem.overall_score)}
                        </div>
                      </div>
                      <div className="shrink-0 text-stone-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-stone-200 p-4 sm:p-6 bg-stone-50/50 space-y-4">
                      {/* Rating Breakdown */}
                      <div>
                        <h4 className="text-sm font-medium text-stone-700 mb-3">Rating Breakdown</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {Object.entries(evalItem.ratings).map(([key, value]) => (
                            <div key={key} className="flex items-center justify-between bg-white rounded-xl p-3 border border-stone-200">
                              <span className="text-sm text-stone-700 capitalize">{key.replace(/_/g, ' ')}</span>
                              <div className="flex items-center gap-2">
                                {renderStars(value as number)}
                                <span className="text-sm font-medium text-stone-900 w-6 text-right">{value as number}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Comments */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-stone-500" />
                          <h4 className="text-sm font-medium text-stone-700">Comments</h4>
                        </div>
                        <p className="text-sm text-stone-600 bg-white rounded-xl p-4 border border-stone-200 leading-relaxed">
                          {evalItem.comments}
                        </p>
                      </div>

                      {evalItem.strengths && (
                        <div>
                          <h4 className="text-sm font-medium text-green-700 mb-1">Strengths</h4>
                          <p className="text-sm text-stone-600 bg-green-50 rounded-xl p-3 border border-green-200">
                            {evalItem.strengths}
                          </p>
                        </div>
                      )}

                      {evalItem.areas_for_improvement && (
                        <div>
                          <h4 className="text-sm font-medium text-amber-700 mb-1">Areas for Improvement</h4>
                          <p className="text-sm text-stone-600 bg-amber-50 rounded-xl p-3 border border-amber-200">
                            {evalItem.areas_for_improvement}
                          </p>
                        </div>
                      )}

                      {/* Evaluator Info */}
                      <div className="flex items-center gap-3 pt-2 border-t border-stone-200">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs">
                          {isStudent
                            ? `${evalItem.preceptor?.first_name?.[0] || ''}${evalItem.preceptor?.last_name?.[0] || ''}`
                            : `${evalItem.student?.first_name?.[0] || ''}${evalItem.student?.last_name?.[0] || ''}`
                          }
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-900">
                            {isStudent
                              ? `${evalItem.preceptor?.first_name || ''} ${evalItem.preceptor?.last_name || ''}`
                              : `${evalItem.student?.first_name || ''} ${evalItem.student?.last_name || ''}`
                            }
                          </p>
                          <p className="text-xs text-stone-500">{isStudent ? 'Preceptor' : 'Student'} - {evalItem.slot?.site?.name || evalItem.slot?.title}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* SUMMARY VIEW */}
      {viewTab === 'summary' && (
        <div className="space-y-6">
          {evaluations.length === 0 ? (
            <Card className="text-center py-12">
              <BarChart3 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-700 mb-2">No data yet</h3>
              <p className="text-stone-500">Performance summary will appear after you receive evaluations</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Averages */}
              <Card>
                <h3 className="font-semibold text-stone-900 mb-4">Skill Ratings</h3>
                <div className="space-y-3">
                  {categoryAverages.map(cat => (
                    <div key={cat.key}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-stone-700 capitalize">{cat.label}</span>
                        <div className="flex items-center gap-2">
                          {renderStars(cat.avg)}
                          <span className="font-medium text-stone-900 w-8 text-right">{cat.avg}</span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${cat.avg >= 4 ? 'bg-green-500' : cat.avg >= 3 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${(cat.avg / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Score Trend */}
              <Card>
                <h3 className="font-semibold text-stone-900 mb-4">Score History</h3>
                <div className="space-y-3">
                  {scoreTrend.map((point, i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        point.score >= 4 ? 'bg-green-50 text-green-600' :
                        point.score >= 3 ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        <span className="text-lg font-bold">{point.score}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-stone-900">{getTypeLabel(point.type)} Evaluation</p>
                          <Badge variant={getTypeVariant(point.type)} size="sm">{getTypeLabel(point.type)}</Badge>
                        </div>
                        <p className="text-xs text-stone-500">{point.date}</p>
                      </div>
                      {renderStars(point.score)}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Strengths & Improvements */}
              <Card>
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" /> Top Strengths
                </h3>
                {categoryAverages.slice(0, 3).map(cat => (
                  <div key={cat.key} className="flex items-center justify-between p-2 mb-1">
                    <span className="text-sm text-stone-700 capitalize">{cat.label}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(cat.avg)}
                      <span className="text-sm font-semibold text-green-600 ml-1">{cat.avg}</span>
                    </div>
                  </div>
                ))}
              </Card>

              <Card>
                <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 rotate-180" /> Areas to Develop
                </h3>
                {categoryAverages.slice(-3).reverse().map(cat => (
                  <div key={cat.key} className="flex items-center justify-between p-2 mb-1">
                    <span className="text-sm text-stone-700 capitalize">{cat.label}</span>
                    <div className="flex items-center gap-1">
                      {renderStars(cat.avg)}
                      <span className="text-sm font-semibold text-amber-600 ml-1">{cat.avg}</span>
                    </div>
                  </div>
                ))}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* Create Evaluation Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title={isStudent ? 'Site & Preceptor Feedback' : 'New Evaluation'}
        size="lg"
      >
        <div className="space-y-5">
          {isStudent && (
            <div className="bg-secondary-50 rounded-xl p-4 text-sm text-secondary-800">
              <p className="font-medium mb-1">Help improve clinical education!</p>
              <p className="text-xs text-secondary-700">Your feedback helps other students find great rotations and helps sites improve their programs. All feedback is confidential.</p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!isStudent && (
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-stone-700">Evaluation Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm({ ...form, type: e.target.value as typeof form.type })}
                  className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                >
                  <option value="mid_rotation">Mid-Rotation</option>
                  <option value="final">Final</option>
                  <option value="student_feedback">Student Feedback</option>
                </select>
              </div>
            )}
            <div className={`space-y-1.5 ${isStudent ? 'sm:col-span-2' : ''}`}>
              <label className="block text-sm font-medium text-stone-700">Rotation *</label>
              <select
                value={form.slot_id}
                onChange={e => {
                  const app = acceptedApps.find(a => a.slot_id === e.target.value)
                  setForm({ ...form, slot_id: e.target.value, student_id: app?.student_id || '' })
                }}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                <option value="">Select rotation...</option>
                {acceptedApps.map(app => (
                  <option key={app.id} value={app.slot_id}>
                    {app.slot?.title || 'Rotation'} - {app.slot?.site?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ratings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-stone-700">
                {isStudent ? 'Rate Your Experience' : 'Performance Ratings'}
              </h3>
              {overallScore() > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500">Overall:</span>
                  <span className="text-lg font-bold text-amber-500">{overallScore()}</span>
                  {renderStars(overallScore(), 'md')}
                </div>
              )}
            </div>
            <div className="space-y-3">
              {(isStudent ? [
                { key: 'clinical_environment', label: 'Clinical Environment' },
                { key: 'preceptor_teaching', label: 'Preceptor Teaching Quality' },
                { key: 'learning_opportunities', label: 'Learning Opportunities' },
                { key: 'support_mentorship', label: 'Support & Mentorship' },
                { key: 'organization', label: 'Site Organization' },
                { key: 'communication', label: 'Communication' },
                { key: 'work_life_balance', label: 'Work-Life Balance' },
                { key: 'overall_experience', label: 'Overall Experience' },
              ] : RATING_CATEGORIES).map(cat => (
                <div key={cat.key} className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white">
                  <span className="text-sm text-stone-700">{cat.label}</span>
                  {renderInteractiveStars(cat.key)}
                </div>
              ))}
            </div>
          </div>

          {/* Text Fields */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">
              {isStudent ? 'Your Feedback *' : 'Comments *'}
            </label>
            <textarea
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })}
              rows={4}
              placeholder={isStudent
                ? 'Share your overall experience with this rotation. What did you learn? How was the preceptor?'
                : "Provide detailed feedback on the student's clinical performance..."
              }
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-green-700">
                {isStudent ? 'What was great?' : 'Strengths'}
              </label>
              <textarea
                value={form.strengths}
                onChange={e => setForm({ ...form, strengths: e.target.value })}
                rows={3}
                placeholder={isStudent ? 'What aspects of the rotation were excellent?' : 'Areas where the student excels...'}
                className="w-full rounded-xl border border-green-200 px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none resize-none bg-green-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-amber-700">
                {isStudent ? 'What could improve?' : 'Areas for Improvement'}
              </label>
              <textarea
                value={form.areas_for_improvement}
                onChange={e => setForm({ ...form, areas_for_improvement: e.target.value })}
                rows={3}
                placeholder={isStudent ? 'Suggestions for improving the rotation experience...' : 'Areas where the student can grow...'}
                className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none resize-none bg-amber-50/50"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending}>
              <ClipboardCheck className="w-4 h-4" /> {isStudent ? 'Submit Feedback' : 'Submit Evaluation'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
