import { useState } from 'react'
import { Modal } from '../ui/Modal.tsx'
import { Button } from '../ui/Button.tsx'
import { Input } from '../ui/Input.tsx'
import { useBroadcastMessage } from '../../hooks/useApi.ts'
import { useAuth } from '../../contexts/AuthContext.tsx'
import { toast } from 'sonner'
import { Megaphone, Loader2, Users } from 'lucide-react'

interface BroadcastModalProps {
  open: boolean
  onClose: () => void
  onSent?: (conversationId: string) => void
  programs?: { id: string; name: string }[]
}

export function BroadcastModal({ open, onClose, onSent, programs }: BroadcastModalProps) {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [audience, setAudience] = useState<'all_students' | 'program' | 'role'>('all_students')
  const [programId, setProgramId] = useState('')
  const [role, setRole] = useState('student')

  const broadcastMutation = useBroadcastMessage()

  const handleSend = () => {
    if (!subject.trim() || !body.trim()) {
      toast.error('Subject and message are required')
      return
    }

    broadcastMutation.mutate(
      {
        subject: subject.trim(),
        body: body.trim(),
        audience,
        ...(audience === 'program' ? { program_id: programId } : {}),
        ...(audience === 'role' ? { role } : {}),
      },
      {
        onSuccess: (data) => {
          toast.success(`Broadcast sent to ${data.recipients_count} recipient(s)`)
          setSubject('')
          setBody('')
          onClose()
          onSent?.(data.conversation.id)
        },
        onError: (err) => {
          toast.error((err as Error).message || 'Failed to send broadcast')
        },
      }
    )
  }

  return (
    <Modal isOpen={open} onClose={onClose} title="Send Broadcast">
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
          <Megaphone className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-sm text-stone-700">
            Broadcasts send a one-way announcement to all selected recipients as a group conversation.
          </p>
        </div>

        {/* Audience */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Audience</label>
          <select
            value={audience}
            onChange={e => setAudience(e.target.value as typeof audience)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
          >
            <option value="all_students">All Students</option>
            {(programs && programs.length > 0) && <option value="program">By Program</option>}
            {isAdmin && <option value="role">By Role</option>}
          </select>
        </div>

        {audience === 'program' && programs && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Program</label>
            <select
              value={programId}
              onChange={e => setProgramId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="">Select a program...</option>
              {programs.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        )}

        {audience === 'role' && isAdmin && (
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Role</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="student">Students</option>
              <option value="preceptor">Preceptors</option>
              <option value="site_manager">Site Managers</option>
              <option value="coordinator">Coordinators</option>
              <option value="professor">Professors</option>
            </select>
          </div>
        )}

        {/* Subject */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Subject</label>
          <Input
            value={subject}
            onChange={e => setSubject(e.target.value)}
            placeholder="Announcement subject..."
            maxLength={255}
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Type your broadcast message..."
            rows={5}
            maxLength={10000}
            className="w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleSend}
            disabled={broadcastMutation.isPending || !subject.trim() || !body.trim()}
          >
            {broadcastMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</>
              : <><Megaphone className="w-4 h-4" /> Send Broadcast</>
            }
          </Button>
        </div>
      </div>
    </Modal>
  )
}
