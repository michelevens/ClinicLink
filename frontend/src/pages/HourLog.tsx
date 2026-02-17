import { useState, useMemo } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useHourLogs, useHourSummary, useCreateHourLog, useDeleteHourLog, useReviewHourLog, useApplications } from '../hooks/useApi.ts'
import { useAuth } from '../contexts/AuthContext.tsx'
import { toast } from 'sonner'
import type { ApiHourLog } from '../services/api.ts'
import { exportsApi } from '../services/api.ts'
import {
  Clock, Plus, CheckCircle, AlertCircle, Calendar, Loader2,
  Trash2, Building2, ChevronDown, ChevronUp, Target,
  TrendingUp, Eye, Filter, BarChart3, XCircle, User,
  ClipboardCheck, Download
} from 'lucide-react'
import { usePageTitle } from '../hooks/usePageTitle.ts'

type ViewTab = 'all' | 'by-rotation' | 'summary'
type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected'

export function HourLog() {
  usePageTitle('Hour Log')
  const { user } = useAuth()
  const isPreceptor = user?.role === 'preceptor' || user?.role === 'site_manager'

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEntryDetail, setShowEntryDetail] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<ApiHourLog | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved')
  const [rejectionReason, setRejectionReason] = useState('')
  const [viewTab, setViewTab] = useState<ViewTab>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(isPreceptor ? 'pending' : 'all')
  const [expandedRotation, setExpandedRotation] = useState<string | null>(null)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [newEntry, setNewEntry] = useState({
    slot_id: '',
    date: new Date().toISOString().split('T')[0],
    hours_worked: '8',
    category: 'direct_care',
    description: '',
  })

  const { data: hoursData, isLoading } = useHourLogs()
  const { data: summary } = useHourSummary()
  const { data: appsData } = useApplications()
  const createMutation = useCreateHourLog()
  const deleteMutation = useDeleteHourLog()
  const reviewMutation = useReviewHourLog()

  const hours = hoursData?.data || []
  const acceptedApps = (appsData?.data || []).filter(a => a.status === 'accepted')

  const platformHours = summary?.platform_hours || hours.reduce((sum, h) => sum + Number(h.hours_worked), 0)
  const approvedHours = summary?.approved_hours || hours.filter(h => h.status === 'approved').reduce((sum, h) => sum + Number(h.hours_worked), 0)
  const pendingHours = summary?.pending_hours || hours.filter(h => h.status === 'pending').reduce((sum, h) => sum + Number(h.hours_worked), 0)
  const rejectedHours = hours.filter(h => h.status === 'rejected').reduce((sum, h) => sum + Number(h.hours_worked), 0)
  const priorHours = summary?.prior_hours || 0
  const totalHours = summary?.total_hours || (priorHours + approvedHours)
  const hoursRequired = summary?.hours_required || 0
  const progress = summary?.progress_percent || (hoursRequired > 0 ? Math.min(100, Math.round((totalHours / hoursRequired) * 100)) : 0)

  const categoryLabels: Record<string, string> = {
    direct_care: 'Direct Patient Care',
    indirect_care: 'Indirect Care',
    simulation: 'Simulation',
    observation: 'Observation',
    other: 'Other',
  }

  const categoryColors: Record<string, string> = {
    direct_care: 'bg-primary-500',
    indirect_care: 'bg-secondary-500',
    simulation: 'bg-amber-500',
    observation: 'bg-green-500',
    other: 'bg-stone-400',
  }

  // Filter hours
  const filteredHours = statusFilter === 'all' ? hours : hours.filter(h => h.status === statusFilter)

  // Group hours by rotation (slot)
  const hoursByRotation = useMemo(() => {
    const map = new Map<string, { slotTitle: string; siteName: string; hours: ApiHourLog[]; total: number; approved: number; pending: number }>()
    for (const h of hours) {
      const key = h.slot_id
      if (!map.has(key)) {
        map.set(key, {
          slotTitle: h.slot?.title || 'Unknown Rotation',
          siteName: h.slot?.site?.name || '',
          hours: [],
          total: 0,
          approved: 0,
          pending: 0,
        })
      }
      const group = map.get(key)!
      group.hours.push(h)
      group.total += Number(h.hours_worked)
      if (h.status === 'approved') group.approved += Number(h.hours_worked)
      if (h.status === 'pending') group.pending += Number(h.hours_worked)
    }
    return Array.from(map.entries())
  }, [hours])

  // Group hours by student (preceptor view)
  const hoursByStudent = useMemo(() => {
    if (!isPreceptor) return []
    const map = new Map<string, { studentName: string; hours: ApiHourLog[]; total: number; approved: number; pending: number }>()
    for (const h of hours) {
      const key = h.student_id
      if (!map.has(key)) {
        map.set(key, {
          studentName: h.student ? `${h.student.first_name} ${h.student.last_name}` : 'Unknown Student',
          hours: [],
          total: 0,
          approved: 0,
          pending: 0,
        })
      }
      const group = map.get(key)!
      group.hours.push(h)
      group.total += Number(h.hours_worked)
      if (h.status === 'approved') group.approved += Number(h.hours_worked)
      if (h.status === 'pending') group.pending += Number(h.hours_worked)
    }
    return Array.from(map.entries())
  }, [hours, isPreceptor])

  // Category breakdown for summary
  const categoryBreakdown = useMemo(() => {
    const totals: Record<string, number> = {}
    for (const h of hours) {
      totals[h.category] = (totals[h.category] || 0) + Number(h.hours_worked)
    }
    return Object.entries(totals).sort((a, b) => b[1] - a[1])
  }, [hours])

  // Weekly summary
  const weeklySummary = useMemo(() => {
    const weeks = new Map<string, number>()
    for (const h of hours) {
      const d = new Date(h.date)
      const weekStart = new Date(d)
      weekStart.setDate(d.getDate() - d.getDay())
      const key = weekStart.toISOString().split('T')[0]
      weeks.set(key, (weeks.get(key) || 0) + Number(h.hours_worked))
    }
    return Array.from(weeks.entries()).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 8)
  }, [hours])

  const handleAddHours = async () => {
    if (!newEntry.slot_id) {
      toast.error('Please select a rotation')
      return
    }
    if (parseFloat(newEntry.hours_worked) <= 0 || parseFloat(newEntry.hours_worked) > 24) {
      toast.error('Hours must be between 0.5 and 24')
      return
    }
    try {
      await createMutation.mutateAsync({
        slot_id: newEntry.slot_id,
        date: newEntry.date,
        hours_worked: parseFloat(newEntry.hours_worked),
        category: newEntry.category,
        description: newEntry.description,
      })
      toast.success('Hours logged successfully! Awaiting preceptor approval.')
      setShowAddModal(false)
      setNewEntry({ slot_id: '', date: new Date().toISOString().split('T')[0], hours_worked: '8', category: 'direct_care', description: '' })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to log hours'
      toast.error(message)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id)
      toast.success('Hour entry deleted')
      setShowDeleteConfirm(false)
      setShowEntryDetail(false)
      setSelectedEntry(null)
    } catch {
      toast.error('Failed to delete entry')
    }
  }

  const handleReview = async () => {
    if (!selectedEntry) return
    if (reviewAction === 'rejected' && !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    try {
      await reviewMutation.mutateAsync({
        id: selectedEntry.id,
        data: {
          status: reviewAction,
          rejection_reason: reviewAction === 'rejected' ? rejectionReason : undefined,
        },
      })
      toast.success(reviewAction === 'approved' ? 'Hours approved successfully' : 'Hours rejected')
      setShowReviewModal(false)
      setShowEntryDetail(false)
      setSelectedEntry(null)
      setRejectionReason('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to review hours'
      toast.error(message)
    }
  }

  const openReview = (entry: ApiHourLog, action: 'approved' | 'rejected') => {
    setSelectedEntry(entry)
    setReviewAction(action)
    setRejectionReason('')
    setShowReviewModal(true)
  }

  const openEntryDetail = (entry: ApiHourLog) => {
    setSelectedEntry(entry)
    setShowEntryDetail(true)
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
          <h1 className="text-2xl font-bold text-stone-900">
            {isPreceptor ? 'Hour Log Review' : 'Clinical Hour Log'}
          </h1>
          <p className="text-stone-500">
            {isPreceptor ? 'Review and approve student clinical hours' : 'Track and manage your clinical hours'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button variant="secondary" onClick={() => setShowExportMenu(!showExportMenu)}>
              <Download className="w-4 h-4" /> Export
            </Button>
            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)} />
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-stone-200 py-1 z-20">
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50" onClick={() => { window.open(exportsApi.hourLogsCsvUrl()); setShowExportMenu(false) }}>Download CSV</button>
                  <button className="w-full text-left px-4 py-2 text-sm hover:bg-stone-50" onClick={() => { window.open(exportsApi.hourLogsPdfUrl()); setShowExportMenu(false) }}>Download PDF</button>
                </div>
              </>
            )}
          </div>
          {!isPreceptor && (
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="w-4 h-4" /> Log Hours
            </Button>
          )}
        </div>
      </div>

      {/* Overall Progress - Student only */}
      {!isPreceptor && (
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-stone-900">Hours Progress</h3>
              </div>
              <p className="text-sm text-stone-600 mb-3">
                {hoursRequired > 0
                  ? `${totalHours} of ${hoursRequired} required hours completed`
                  : 'No program assigned'}
              </p>
              <div className="w-full bg-white/60 rounded-full h-3 mb-2">
                <div className="h-3 flex rounded-full overflow-hidden">
                  {priorHours > 0 && (
                    <div
                      className="h-full bg-stone-400 transition-all duration-500"
                      style={{ width: `${hoursRequired > 0 ? Math.min((priorHours / hoursRequired) * 100, 100) : 0}%` }}
                    />
                  )}
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500 transition-all duration-500"
                    style={{ width: `${hoursRequired > 0 ? Math.min((approvedHours / hoursRequired) * 100, 100 - (priorHours / hoursRequired) * 100) : 0}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-stone-500">
                <span>{progress}% complete</span>
                <span>{hoursRequired - totalHours > 0 ? `${hoursRequired - totalHours} hours remaining` : hoursRequired > 0 ? 'Requirement met!' : ''}</span>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              {priorHours > 0 && (
                <div className="text-center">
                  <p className="text-2xl font-bold text-stone-500">{priorHours}</p>
                  <p className="text-xs text-stone-500">Prior</p>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-900">{platformHours}</p>
                <p className="text-xs text-stone-500">Platform</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{approvedHours}</p>
                <p className="text-xs text-stone-500">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{pendingHours}</p>
                <p className="text-xs text-stone-500">Pending</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Preceptor Summary Banner */}
      {isPreceptor && (
        <Card className="bg-gradient-to-r from-primary-50 to-secondary-50 border-primary-200">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <ClipboardCheck className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-stone-900">Review Summary</h3>
              </div>
              <p className="text-sm text-stone-600">You have {hours.filter(h => h.status === 'pending').length} hour entries pending review</p>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{hours.filter(h => h.status === 'pending').length}</p>
                <p className="text-xs text-stone-500">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{hours.filter(h => h.status === 'approved').length}</p>
                <p className="text-xs text-stone-500">Approved</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{hours.filter(h => h.status === 'rejected').length}</p>
                <p className="text-xs text-stone-500">Rejected</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-stone-900">{totalHours}</p>
                <p className="text-xs text-stone-500">Total Hours</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {isPreceptor ? (
          <>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><User className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-stone-900">{hoursByStudent.length}</p><p className="text-xs text-stone-500">Students</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-stone-900">{pendingHours}</p><p className="text-xs text-stone-500">Pending Hours</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-stone-900">{approvedHours}</p><p className="text-xs text-stone-500">Approved Hours</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-stone-900">{hours.length}</p><p className="text-xs text-stone-500">Total Entries</p></div>
              </div>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-stone-900">{totalHours}</p><p className="text-xs text-stone-500">Total Hours</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center"><CheckCircle className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-stone-900">{approvedHours}</p><p className="text-xs text-stone-500">Approved</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center"><AlertCircle className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-stone-900">{pendingHours}</p><p className="text-xs text-stone-500">Pending</p></div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-50 text-secondary-600 flex items-center justify-center"><TrendingUp className="w-5 h-5" /></div>
                <div><p className="text-2xl font-bold text-stone-900">{hours.length}</p><p className="text-xs text-stone-500">Entries</p></div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* View Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {([
          { key: 'all' as ViewTab, label: isPreceptor ? 'All Submissions' : 'All Entries', icon: <Clock className="w-4 h-4" /> },
          { key: 'by-rotation' as ViewTab, label: isPreceptor ? 'By Student' : 'By Rotation', icon: isPreceptor ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" /> },
          { key: 'summary' as ViewTab, label: 'Summary', icon: <BarChart3 className="w-4 h-4" /> },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => setViewTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              viewTab === tab.key ? 'bg-primary-500 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* ALL ENTRIES VIEW */}
      {viewTab === 'all' && (
        <>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === s ? 'bg-primary-100 text-primary-700' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
                {s !== 'all' && ` (${hours.filter(h => h.status === s).length})`}
              </button>
            ))}
          </div>

          <Card padding="none">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    {isPreceptor && <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase">Student</th>}
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase">Date</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase">Hours</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase hidden sm:table-cell">Category</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase hidden md:table-cell">Rotation</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase hidden lg:table-cell">Description</th>
                    <th className="text-left px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase">Status</th>
                    <th className="text-right px-4 sm:px-6 py-3 text-xs font-medium text-stone-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredHours.length === 0 && (
                    <tr>
                      <td colSpan={isPreceptor ? 8 : 7} className="px-6 py-8 text-center text-stone-400">
                        {isPreceptor
                          ? statusFilter === 'all' ? 'No hour submissions from students yet.' : `No ${statusFilter} entries found.`
                          : statusFilter === 'all' ? 'No hours logged yet. Click "Log Hours" to get started.' : `No ${statusFilter} entries found.`}
                      </td>
                    </tr>
                  )}
                  {filteredHours.map(entry => (
                    <tr key={entry.id} className="hover:bg-stone-50 transition-colors cursor-pointer" onClick={() => openEntryDetail(entry)}>
                      {isPreceptor && (
                        <td className="px-4 sm:px-6 py-4 text-sm text-stone-900 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold shrink-0">
                              {entry.student?.first_name?.[0]}{entry.student?.last_name?.[0]}
                            </div>
                            <span className="font-medium">{entry.student?.first_name} {entry.student?.last_name}</span>
                          </div>
                        </td>
                      )}
                      <td className="px-4 sm:px-6 py-4 text-sm text-stone-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-stone-400 hidden sm:block" />
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm font-semibold text-stone-900">{entry.hours_worked}h</td>
                      <td className="px-4 sm:px-6 py-4 hidden sm:table-cell"><Badge variant="default">{categoryLabels[entry.category] || entry.category}</Badge></td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-stone-600 hidden md:table-cell">
                        <span className="truncate max-w-[150px] block">{entry.slot?.title || '-'}</span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-sm text-stone-600 max-w-xs truncate hidden lg:table-cell">{entry.description || '-'}</td>
                      <td className="px-4 sm:px-6 py-4">
                        <Badge variant={entry.status === 'approved' ? 'success' : entry.status === 'pending' ? 'warning' : 'danger'}>
                          {entry.status}
                        </Badge>
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={e => { e.stopPropagation(); openEntryDetail(entry) }} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {isPreceptor && entry.status === 'pending' && (
                            <>
                              <button onClick={e => { e.stopPropagation(); openReview(entry, 'approved') }} className="p-1.5 rounded-lg hover:bg-green-50 text-stone-400 hover:text-green-600 transition-colors" title="Approve">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={e => { e.stopPropagation(); openReview(entry, 'rejected') }} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors" title="Reject">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {!isPreceptor && entry.status === 'pending' && (
                            <button onClick={e => { e.stopPropagation(); setSelectedEntry(entry); setShowDeleteConfirm(true) }} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* BY ROTATION / BY STUDENT VIEW */}
      {viewTab === 'by-rotation' && (
        <div className="space-y-4">
          {isPreceptor ? (
            <>
              {hoursByStudent.length === 0 && (
                <Card className="text-center py-12">
                  <User className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-700 mb-2">No student hours yet</h3>
                  <p className="text-stone-500">Student hour submissions will appear here for review</p>
                </Card>
              )}
              {hoursByStudent.map(([studentId, group]) => {
                const isExpanded = expandedRotation === studentId
                return (
                  <Card key={studentId} padding="none">
                    <div className="p-4 sm:p-5 cursor-pointer hover:bg-stone-50/50 transition-colors" onClick={() => setExpandedRotation(isExpanded ? null : studentId)}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm shrink-0">
                          {group.studentName.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-stone-900">{group.studentName}</h3>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="text-sm font-medium text-stone-900">{group.total}h total</span>
                            <span className="text-sm text-green-600">{group.approved}h approved</span>
                            {group.pending > 0 && <span className="text-sm text-amber-600">{group.pending}h pending</span>}
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2">
                            <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${group.total > 0 ? (group.approved / group.total) * 100 : 0}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {group.pending > 0 && <Badge variant="warning">{group.pending}h pending</Badge>}
                          <Badge variant="default">{group.hours.length} entries</Badge>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-stone-200">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-stone-50">
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500">Date</th>
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500">Hours</th>
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500 hidden sm:table-cell">Category</th>
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500 hidden md:table-cell">Rotation</th>
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500">Status</th>
                                <th className="text-right px-4 sm:px-6 py-2 text-xs font-medium text-stone-500">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {group.hours.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                <tr key={entry.id} className="hover:bg-stone-50/50 cursor-pointer" onClick={() => openEntryDetail(entry)}>
                                  <td className="px-4 sm:px-6 py-3 text-sm text-stone-900">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                  <td className="px-4 sm:px-6 py-3 text-sm font-semibold text-stone-900">{entry.hours_worked}h</td>
                                  <td className="px-4 sm:px-6 py-3 hidden sm:table-cell"><Badge variant="default" size="sm">{categoryLabels[entry.category] || entry.category}</Badge></td>
                                  <td className="px-4 sm:px-6 py-3 text-sm text-stone-600 hidden md:table-cell">{entry.slot?.title || '-'}</td>
                                  <td className="px-4 sm:px-6 py-3">
                                    <Badge variant={entry.status === 'approved' ? 'success' : entry.status === 'pending' ? 'warning' : 'danger'} size="sm">{entry.status}</Badge>
                                  </td>
                                  <td className="px-4 sm:px-6 py-3 text-right">
                                    {entry.status === 'pending' && (
                                      <div className="flex items-center justify-end gap-1">
                                        <button onClick={e => { e.stopPropagation(); openReview(entry, 'approved') }} className="p-1 rounded-lg hover:bg-green-50 text-stone-400 hover:text-green-600 transition-colors"><CheckCircle className="w-4 h-4" /></button>
                                        <button onClick={e => { e.stopPropagation(); openReview(entry, 'rejected') }} className="p-1 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors"><XCircle className="w-4 h-4" /></button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </>
          ) : (
            <>
              {hoursByRotation.length === 0 && (
                <Card className="text-center py-12">
                  <Building2 className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-stone-700 mb-2">No rotation hours yet</h3>
                  <p className="text-stone-500">Start logging hours for your accepted rotations</p>
                </Card>
              )}
              {hoursByRotation.map(([slotId, group]) => {
                const isExpanded = expandedRotation === slotId
                return (
                  <Card key={slotId} padding="none">
                    <div className="p-4 sm:p-5 cursor-pointer hover:bg-stone-50/50 transition-colors" onClick={() => setExpandedRotation(isExpanded ? null : slotId)}>
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0"><Building2 className="w-5 h-5" /></div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-stone-900">{group.slotTitle}</h3>
                          <p className="text-sm text-stone-500">{group.siteName}</p>
                          <div className="flex flex-wrap gap-3 mt-2">
                            <span className="text-sm font-medium text-stone-900">{group.total}h total</span>
                            <span className="text-sm text-green-600">{group.approved}h approved</span>
                            {group.pending > 0 && <span className="text-sm text-amber-600">{group.pending}h pending</span>}
                          </div>
                          <div className="w-full bg-stone-200 rounded-full h-1.5 mt-2">
                            <div className="h-1.5 rounded-full bg-green-500" style={{ width: `${group.total > 0 ? (group.approved / group.total) * 100 : 0}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="default">{group.hours.length} entries</Badge>
                          {isExpanded ? <ChevronUp className="w-5 h-5 text-stone-400" /> : <ChevronDown className="w-5 h-5 text-stone-400" />}
                        </div>
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-stone-200">
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-stone-50">
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500">Date</th>
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500">Hours</th>
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500 hidden sm:table-cell">Category</th>
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500 hidden md:table-cell">Description</th>
                                <th className="text-left px-4 sm:px-6 py-2 text-xs font-medium text-stone-500">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {group.hours.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(entry => (
                                <tr key={entry.id} className="hover:bg-stone-50/50 cursor-pointer" onClick={() => openEntryDetail(entry)}>
                                  <td className="px-4 sm:px-6 py-3 text-sm text-stone-900">{new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                                  <td className="px-4 sm:px-6 py-3 text-sm font-semibold text-stone-900">{entry.hours_worked}h</td>
                                  <td className="px-4 sm:px-6 py-3 hidden sm:table-cell"><Badge variant="default" size="sm">{categoryLabels[entry.category] || entry.category}</Badge></td>
                                  <td className="px-4 sm:px-6 py-3 text-sm text-stone-600 truncate max-w-xs hidden md:table-cell">{entry.description || '-'}</td>
                                  <td className="px-4 sm:px-6 py-3">
                                    <Badge variant={entry.status === 'approved' ? 'success' : entry.status === 'pending' ? 'warning' : 'danger'} size="sm">{entry.status}</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })}
            </>
          )}
        </div>
      )}

      {/* SUMMARY VIEW */}
      {viewTab === 'summary' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="font-semibold text-stone-900 mb-4">Hours by Category</h3>
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-3">
                {categoryBreakdown.map(([cat, catHours]) => (
                  <div key={cat}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-stone-700">{categoryLabels[cat] || cat}</span>
                      <span className="font-medium text-stone-900">{catHours}h ({totalHours > 0 ? Math.round((catHours / totalHours) * 100) : 0}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2.5">
                      <div className={`h-2.5 rounded-full ${categoryColors[cat] || 'bg-stone-400'}`} style={{ width: `${totalHours > 0 ? (catHours / totalHours) * 100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-stone-900 mb-4">Weekly Hours</h3>
            {weeklySummary.length === 0 ? (
              <p className="text-sm text-stone-400 text-center py-8">No data yet</p>
            ) : (
              <div className="space-y-2">
                {weeklySummary.map(([weekStart, weekHours]) => {
                  const maxHours = Math.max(...weeklySummary.map(w => w[1]))
                  const weekEndDate = new Date(weekStart)
                  weekEndDate.setDate(weekEndDate.getDate() + 6)
                  return (
                    <div key={weekStart} className="flex items-center gap-3">
                      <span className="text-xs text-stone-500 w-28 shrink-0">
                        {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 bg-stone-100 rounded-full h-5 relative">
                        <div className="h-5 rounded-full bg-gradient-to-r from-primary-400 to-primary-500 flex items-center justify-end pr-2" style={{ width: `${maxHours > 0 ? Math.max(20, (weekHours / maxHours) * 100) : 0}%` }}>
                          <span className="text-xs font-medium text-white">{weekHours}h</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>

          <Card>
            <h3 className="font-semibold text-stone-900 mb-4">Status Overview</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-green-600">{approvedHours}h</p>
                <p className="text-xs text-green-700">Approved</p>
                <p className="text-xs text-stone-500 mt-1">{hours.filter(h => h.status === 'approved').length} entries</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-amber-600">{pendingHours}h</p>
                <p className="text-xs text-amber-700">Pending</p>
                <p className="text-xs text-stone-500 mt-1">{hours.filter(h => h.status === 'pending').length} entries</p>
              </div>
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-2xl font-bold text-red-600">{rejectedHours}h</p>
                <p className="text-xs text-red-700">Rejected</p>
                <p className="text-xs text-stone-500 mt-1">{hours.filter(h => h.status === 'rejected').length} entries</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="font-semibold text-stone-900 mb-4">{isPreceptor ? 'Hours by Student' : 'Hours by Rotation'}</h3>
            {isPreceptor ? (
              hoursByStudent.length === 0 ? <p className="text-sm text-stone-400 text-center py-8">No data yet</p> : (
                <div className="space-y-3">
                  {hoursByStudent.map(([studentId, group]) => (
                    <div key={studentId} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200">
                      <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-xs shrink-0">{group.studentName.split(' ').map(n => n[0]).join('')}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{group.studentName}</p>
                        {group.pending > 0 && <p className="text-xs text-amber-600">{group.pending}h pending review</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-stone-900">{group.total}h</p>
                        <p className="text-xs text-green-600">{group.approved}h approved</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              hoursByRotation.length === 0 ? <p className="text-sm text-stone-400 text-center py-8">No data yet</p> : (
                <div className="space-y-3">
                  {hoursByRotation.map(([slotId, group]) => (
                    <div key={slotId} className="flex items-center gap-3 p-3 rounded-xl border border-stone-200">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0"><Building2 className="w-4 h-4" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-stone-900 truncate">{group.slotTitle}</p>
                        <p className="text-xs text-stone-500">{group.siteName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-stone-900">{group.total}h</p>
                        <p className="text-xs text-green-600">{group.approved}h approved</p>
                      </div>
                    </div>
                  ))}
                </div>
              )
            )}
          </Card>
        </div>
      )}

      {/* Entry Detail Modal */}
      <Modal isOpen={showEntryDetail} onClose={() => { setShowEntryDetail(false); setSelectedEntry(null) }} title="Hour Entry Details" size="md">
        {selectedEntry && (
          <div className="space-y-4">
            <div className={`rounded-xl p-4 ${selectedEntry.status === 'approved' ? 'bg-green-50 border border-green-200' : selectedEntry.status === 'pending' ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center justify-between">
                <Badge variant={selectedEntry.status === 'approved' ? 'success' : selectedEntry.status === 'pending' ? 'warning' : 'danger'} size="md">
                  {selectedEntry.status.charAt(0).toUpperCase() + selectedEntry.status.slice(1)}
                </Badge>
                <span className="text-2xl font-bold text-stone-900">{selectedEntry.hours_worked}h</span>
              </div>
            </div>
            <div className="space-y-3">
              {isPreceptor && selectedEntry.student && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Student</span>
                  <span className="font-medium text-stone-900">{selectedEntry.student.first_name} {selectedEntry.student.last_name}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Date</span>
                <span className="font-medium text-stone-900">{new Date(selectedEntry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Category</span>
                <Badge variant="default">{categoryLabels[selectedEntry.category] || selectedEntry.category}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-stone-500">Rotation</span>
                <span className="font-medium text-stone-900">{selectedEntry.slot?.title || '-'}</span>
              </div>
              {selectedEntry.slot?.site && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Site</span>
                  <span className="font-medium text-stone-900">{selectedEntry.slot.site.name}</span>
                </div>
              )}
              {selectedEntry.approver && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Reviewed By</span>
                  <span className="font-medium text-stone-900">{selectedEntry.approver.first_name} {selectedEntry.approver.last_name}</span>
                </div>
              )}
              {selectedEntry.approved_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-stone-500">Reviewed On</span>
                  <span className="font-medium text-stone-900">{new Date(selectedEntry.approved_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
            {selectedEntry.description && (
              <div>
                <p className="text-sm font-medium text-stone-700 mb-1">Description</p>
                <p className="text-sm text-stone-600 bg-stone-50 rounded-xl p-3">{selectedEntry.description}</p>
              </div>
            )}
            {selectedEntry.rejection_reason && (
              <div>
                <p className="text-sm font-medium text-red-700 mb-1">Rejection Reason</p>
                <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3 border border-red-200">{selectedEntry.rejection_reason}</p>
              </div>
            )}
            <div className="flex gap-3 justify-end pt-2 border-t border-stone-200">
              <Button variant="ghost" onClick={() => { setShowEntryDetail(false); setSelectedEntry(null) }}>Close</Button>
              {isPreceptor && selectedEntry.status === 'pending' && (
                <>
                  <Button variant="danger" size="sm" onClick={() => { setShowEntryDetail(false); openReview(selectedEntry, 'rejected') }}>
                    <XCircle className="w-4 h-4" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => { setShowEntryDetail(false); openReview(selectedEntry, 'approved') }}>
                    <CheckCircle className="w-4 h-4" /> Approve
                  </Button>
                </>
              )}
              {!isPreceptor && selectedEntry.status === 'pending' && (
                <Button variant="danger" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                  <Trash2 className="w-4 h-4" /> Delete Entry
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Review Confirmation Modal (Preceptor) */}
      <Modal isOpen={showReviewModal} onClose={() => { setShowReviewModal(false); setRejectionReason('') }} title={reviewAction === 'approved' ? 'Approve Hours' : 'Reject Hours'} size="sm">
        <div className="space-y-4">
          <div className={`rounded-xl p-4 ${reviewAction === 'approved' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-start gap-3">
              {reviewAction === 'approved' ? <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" /> : <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />}
              <div>
                <p className={`text-sm font-medium ${reviewAction === 'approved' ? 'text-green-900' : 'text-red-900'}`}>
                  {reviewAction === 'approved' ? 'Approve this hour entry?' : 'Reject this hour entry?'}
                </p>
                <p className={`text-sm mt-1 ${reviewAction === 'approved' ? 'text-green-700' : 'text-red-700'}`}>
                  {reviewAction === 'approved' ? 'These hours will count toward the student\'s requirement.' : 'The student will be notified and can re-submit corrected hours.'}
                </p>
              </div>
            </div>
          </div>
          {selectedEntry && (
            <div className="bg-stone-50 rounded-xl p-3 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-stone-500">Student</span><span className="font-medium text-stone-900">{selectedEntry.student?.first_name} {selectedEntry.student?.last_name}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Date</span><span className="text-stone-900">{new Date(selectedEntry.date).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Hours</span><span className="font-semibold text-stone-900">{selectedEntry.hours_worked}h</span></div>
              <div className="flex justify-between"><span className="text-stone-500">Category</span><span className="text-stone-900">{categoryLabels[selectedEntry.category]}</span></div>
              {selectedEntry.description && (
                <div className="pt-1 border-t border-stone-200 mt-1">
                  <p className="text-xs text-stone-500 mb-1">Description:</p>
                  <p className="text-stone-700">{selectedEntry.description}</p>
                </div>
              )}
            </div>
          )}
          {reviewAction === 'rejected' && (
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-red-700">Reason for Rejection *</label>
              <textarea
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Explain why these hours are being rejected..."
                className="w-full rounded-xl border border-red-200 px-4 py-3 text-sm focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none resize-none bg-red-50/50"
              />
            </div>
          )}
          <div className="flex gap-3 justify-end">
            <Button variant="ghost" onClick={() => { setShowReviewModal(false); setRejectionReason('') }}>Cancel</Button>
            <Button variant={reviewAction === 'approved' ? 'primary' : 'danger'} onClick={handleReview} isLoading={reviewMutation.isPending}>
              {reviewAction === 'approved' ? <><CheckCircle className="w-4 h-4" /> Approve</> : <><XCircle className="w-4 h-4" /> Reject</>}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation (Student) */}
      {!isPreceptor && (
        <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Hour Entry" size="sm">
          <div className="space-y-4">
            <div className="bg-red-50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-900">Delete this hour entry?</p>
                  <p className="text-sm text-red-700 mt-1">This action cannot be undone.</p>
                </div>
              </div>
            </div>
            {selectedEntry && (
              <div className="text-sm text-stone-600">
                <p>{new Date(selectedEntry.date).toLocaleDateString()} - {selectedEntry.hours_worked}h ({categoryLabels[selectedEntry.category]})</p>
              </div>
            )}
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
              <Button variant="danger" onClick={() => selectedEntry && handleDelete(selectedEntry.id)} isLoading={deleteMutation.isPending}>
                <Trash2 className="w-4 h-4" /> Delete
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Hours Modal (Student only) */}
      {!isPreceptor && (
        <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Log Clinical Hours">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Rotation *</label>
              <select
                value={newEntry.slot_id}
                onChange={e => setNewEntry({ ...newEntry, slot_id: e.target.value })}
                className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              >
                <option value="">Select a rotation...</option>
                {acceptedApps.map(app => (
                  <option key={app.slot_id} value={app.slot_id}>{app.slot?.title || 'Rotation'} - {app.slot?.site?.name}</option>
                ))}
              </select>
              {acceptedApps.length === 0 && <p className="text-xs text-amber-600">No accepted applications yet. Apply for rotations first.</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Date *" type="date" value={newEntry.date} onChange={e => setNewEntry({ ...newEntry, date: e.target.value })} />
              <Input label="Hours Worked *" type="number" placeholder="8" min="0.5" max="24" step="0.5" value={newEntry.hours_worked} onChange={e => setNewEntry({ ...newEntry, hours_worked: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Category *</label>
              <select value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })} className="w-full rounded-xl border border-stone-300 px-4 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none">
                <option value="direct_care">Direct Patient Care</option>
                <option value="indirect_care">Indirect Care</option>
                <option value="simulation">Simulation</option>
                <option value="observation">Observation</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-stone-700">Description *</label>
              <textarea value={newEntry.description} onChange={e => setNewEntry({ ...newEntry, description: e.target.value })} rows={3} placeholder="Describe what you did during this clinical time..." className="w-full rounded-xl border border-stone-300 px-4 py-3 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none resize-none" />
            </div>
            <div className="bg-stone-50 rounded-xl p-3 text-xs text-stone-500">
              <p className="font-medium text-stone-700 mb-1">Tips for logging hours:</p>
              <ul className="space-y-0.5">
                <li>- Log hours daily for the most accurate records</li>
                <li>- Include specific activities in your description</li>
                <li>- Hours will be sent to your preceptor for approval</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button onClick={handleAddHours} isLoading={createMutation.isPending}><Plus className="w-4 h-4" /> Submit Hours</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
