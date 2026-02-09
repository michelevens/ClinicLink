import { useState } from 'react'
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
  Building2, Loader2, FileText, ChevronDown, ChevronUp
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

export function Evaluations() {
  const { user } = useAuth()
  const [showCreate, setShowCreate] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [form, setForm] = useState({
    type: 'mid_rotation' as 'mid_rotation' | 'final' | 'student_feedback',
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
        type: 'mid_rotation',
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
             isStudent ? 'View your clinical evaluations' :
             'Clinical evaluations overview'}
          </p>
        </div>
        {(isPreceptor || user?.role === 'coordinator') && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4" /> New Evaluation
          </Button>
        )}
      </div>

      {/* Evaluations List */}
      {evaluations.length === 0 && (
        <Card className="text-center py-12">
          <ClipboardCheck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">No evaluations yet</h3>
          <p className="text-stone-500">
            {isPreceptor ? 'Create your first evaluation for a student' : 'No evaluations have been submitted'}
          </p>
        </Card>
      )}

      <div className="space-y-3">
        {evaluations.map(evalItem => {
          const isExpanded = expandedId === evalItem.id
          return (
            <Card key={evalItem.id} padding="none">
              <div
                className="p-4 sm:p-6 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : evalItem.id)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-stone-900">
                        {evalItem.type === 'mid_rotation' ? 'Mid-Rotation' :
                         evalItem.type === 'final' ? 'Final' : 'Student Feedback'}
                        {' Evaluation'}
                      </h3>
                      <Badge variant={evalItem.overall_score >= 4 ? 'success' : evalItem.overall_score >= 3 ? 'warning' : 'danger'}>
                        {evalItem.overall_score}/5
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {isStudent
                          ? `By ${evalItem.preceptor?.first_name} ${evalItem.preceptor?.last_name}`
                          : `${evalItem.student?.first_name} ${evalItem.student?.last_name}`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {evalItem.slot?.title || evalItem.slot?.specialty}
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
                      <FileText className="w-4 h-4 text-stone-500" />
                      <h4 className="text-sm font-medium text-stone-700">Comments</h4>
                    </div>
                    <p className="text-sm text-stone-600 bg-white rounded-xl p-4 border border-stone-200">
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
                </div>
              )}
            </Card>
          )
        })}
      </div>

      {/* Create Evaluation Modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="New Evaluation"
        size="lg"
      >
        <div className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Rotation</label>
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
                    {app.slot?.title || 'Rotation'} - {app.student?.first_name} {app.student?.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Ratings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-stone-700">Performance Ratings</h3>
              {overallScore() > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500">Overall:</span>
                  <span className="text-lg font-bold text-amber-500">{overallScore()}</span>
                  {renderStars(overallScore(), 'md')}
                </div>
              )}
            </div>
            <div className="space-y-3">
              {RATING_CATEGORIES.map(cat => (
                <div key={cat.key} className="flex items-center justify-between p-3 rounded-xl border border-stone-200 bg-white">
                  <span className="text-sm text-stone-700">{cat.label}</span>
                  {renderInteractiveStars(cat.key)}
                </div>
              ))}
            </div>
          </div>

          {/* Text Fields */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Comments *</label>
            <textarea
              value={form.comments}
              onChange={e => setForm({ ...form, comments: e.target.value })}
              rows={4}
              placeholder="Provide detailed feedback on the student's clinical performance..."
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-green-700">Strengths</label>
              <textarea
                value={form.strengths}
                onChange={e => setForm({ ...form, strengths: e.target.value })}
                rows={3}
                placeholder="Areas where the student excels..."
                className="w-full rounded-xl border border-green-200 px-4 py-3 text-sm focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none resize-none bg-green-50/50"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-amber-700">Areas for Improvement</label>
              <textarea
                value={form.areas_for_improvement}
                onChange={e => setForm({ ...form, areas_for_improvement: e.target.value })}
                rows={3}
                placeholder="Areas where the student can grow..."
                className="w-full rounded-xl border border-amber-200 px-4 py-3 text-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:outline-none resize-none bg-amber-50/50"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} isLoading={createMutation.isPending}>
              <ClipboardCheck className="w-4 h-4" /> Submit Evaluation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
