import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { MOCK_HOURS } from '../data/mockData.ts'
import { toast } from 'sonner'
import { Clock, Plus, CheckCircle, AlertCircle, Calendar } from 'lucide-react'

export function HourLog() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [hours] = useState(MOCK_HOURS)

  const totalHours = hours.reduce((sum, h) => sum + h.hoursWorked, 0)
  const approvedHours = hours.filter(h => h.status === 'approved').reduce((sum, h) => sum + h.hoursWorked, 0)
  const pendingHours = hours.filter(h => h.status === 'pending').reduce((sum, h) => sum + h.hoursWorked, 0)

  const handleAddHours = () => {
    toast.success('Hours logged successfully! Awaiting preceptor approval.')
    setShowAddModal(false)
  }

  const categoryLabels: Record<string, string> = {
    direct_care: 'Direct Patient Care',
    indirect_care: 'Indirect Care',
    simulation: 'Simulation',
    observation: 'Observation',
    other: 'Other',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Clinical Hour Log</h1>
          <p className="text-stone-500">Track and manage your clinical hours</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4" /> Log Hours
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{totalHours}</p>
              <p className="text-xs text-stone-500">Total Hours</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{approvedHours}</p>
              <p className="text-xs text-stone-500">Approved</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-stone-900">{pendingHours}</p>
              <p className="text-xs text-stone-500">Pending</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Hour Entries */}
      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase">Date</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase">Hours</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase hidden sm:table-cell">Category</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase hidden md:table-cell">Description</th>
                <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {hours.map(entry => (
                <tr key={entry.id} className="hover:bg-stone-50 transition-colors">
                  <td className="px-4 sm:px-6 py-4 text-sm text-stone-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-stone-400 hidden sm:block" />
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-4 sm:px-6 py-4 text-sm font-semibold text-stone-900">{entry.hoursWorked}h</td>
                  <td className="px-4 sm:px-6 py-4 hidden sm:table-cell"><Badge variant="default">{categoryLabels[entry.category]}</Badge></td>
                  <td className="px-4 sm:px-6 py-4 text-sm text-stone-600 max-w-xs truncate hidden md:table-cell">{entry.description}</td>
                  <td className="px-4 sm:px-6 py-4">
                    <Badge variant={entry.status === 'approved' ? 'success' : entry.status === 'pending' ? 'warning' : 'danger'}>
                      {entry.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Hours Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log Clinical Hours">
        <div className="space-y-4">
          <Input label="Date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
          <Input label="Hours Worked" type="number" placeholder="8" min="0.5" max="24" step="0.5" />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Category</label>
            <select className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none">
              <option value="direct_care">Direct Patient Care</option>
              <option value="indirect_care">Indirect Care</option>
              <option value="simulation">Simulation</option>
              <option value="observation">Observation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-stone-700">Description</label>
            <textarea
              rows={3}
              placeholder="Describe what you did during this clinical time..."
              className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAddHours}>
              <Plus className="w-4 h-4" /> Submit Hours
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
