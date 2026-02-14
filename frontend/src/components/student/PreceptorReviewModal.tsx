import { useState } from 'react'
import { Modal } from '../ui/Modal.tsx'
import { Button } from '../ui/Button.tsx'
import { useCreatePreceptorReview } from '../../hooks/useApi.ts'
import { Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Props {
  isOpen: boolean
  onClose: () => void
  preceptorId: string
  preceptorName: string
  slotId: string
  slotTitle: string
}

const ratingCategories = [
  { key: 'teaching_quality', label: 'Teaching Quality' },
  { key: 'communication', label: 'Communication' },
  { key: 'mentorship', label: 'Mentorship' },
  { key: 'professionalism', label: 'Professionalism' },
  { key: 'feedback_quality', label: 'Feedback Quality' },
  { key: 'availability', label: 'Availability' },
  { key: 'clinical_knowledge', label: 'Clinical Knowledge' },
  { key: 'support', label: 'Support' },
]

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-0.5 transition-colors"
        >
          <Star
            className={`w-5 h-5 ${n <= value ? 'text-amber-400 fill-amber-400' : 'text-stone-300'}`}
          />
        </button>
      ))}
    </div>
  )
}

export function PreceptorReviewModal({ isOpen, onClose, preceptorId, preceptorName, slotId, slotTitle }: Props) {
  const [ratings, setRatings] = useState<Record<string, number>>(
    Object.fromEntries(ratingCategories.map(c => [c.key, 0]))
  )
  const [comments, setComments] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)

  const createReview = useCreatePreceptorReview()

  const allRated = Object.values(ratings).every(v => v > 0)
  const overallScore = allRated
    ? Math.round((Object.values(ratings).reduce((a, b) => a + b, 0) / ratingCategories.length) * 10) / 10
    : 0

  const handleSubmit = () => {
    if (!allRated) {
      toast.error('Please rate all categories')
      return
    }
    createReview.mutate(
      {
        preceptor_id: preceptorId,
        slot_id: slotId,
        ratings,
        comments: comments || undefined,
        overall_score: overallScore,
        is_anonymous: isAnonymous,
      },
      {
        onSuccess: () => {
          toast.success('Review submitted successfully!')
          onClose()
        },
        onError: (err: Error) => toast.error(err.message),
      }
    )
  }

  const setRating = (key: string, value: number) => {
    setRatings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Rate Preceptor" size="lg">
      <div className="space-y-5">
        <div className="bg-primary-50 rounded-xl p-4">
          <p className="font-semibold text-primary-900">{preceptorName}</p>
          <p className="text-sm text-primary-700">{slotTitle}</p>
        </div>

        <div className="space-y-3">
          {ratingCategories.map(cat => (
            <div key={cat.key} className="flex items-center justify-between">
              <span className="text-sm text-stone-700">{cat.label}</span>
              <StarRating value={ratings[cat.key]} onChange={v => setRating(cat.key, v)} />
            </div>
          ))}
        </div>

        {allRated && (
          <div className="flex items-center justify-center gap-2 py-2 bg-amber-50 rounded-xl">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <span className="font-semibold text-stone-900">{overallScore}</span>
            <span className="text-sm text-stone-500">overall</span>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Comments (optional)</label>
          <textarea
            value={comments}
            onChange={e => setComments(e.target.value)}
            rows={3}
            placeholder="Share your experience working with this preceptor..."
            className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={e => setIsAnonymous(e.target.checked)}
            className="rounded border-stone-300 text-primary-600 focus:ring-primary-500"
          />
          <span className="text-sm text-stone-700">Submit anonymously</span>
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!allRated || createReview.isPending}>
            {createReview.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
            Submit Review
          </Button>
        </div>
      </div>
    </Modal>
  )
}
