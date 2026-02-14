import { useState, useMemo, useRef } from 'react'
import { FileText, Plus, Search, Building2, GraduationCap, Calendar, Upload, Download, Paperclip, Filter, Trash2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext.tsx'
import { useAgreements, useCreateAgreement, useUpdateAgreement, useUploadAgreementDocument, useMySites, useSites, useUniversities, useAgreementTemplates, useCreateAgreementTemplate, useDeleteAgreementTemplate } from '../hooks/useApi.ts'
import { agreementsApi } from '../services/api.ts'
import type { ApiAgreement, ApiAgreementTemplate } from '../services/api.ts'
import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { toast } from 'sonner'

const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' | 'secondary' }> = {
  draft: { label: 'Draft', variant: 'default' },
  pending_review: { label: 'Pending Review', variant: 'warning' },
  active: { label: 'Active', variant: 'success' },
  expired: { label: 'Expired', variant: 'danger' },
  terminated: { label: 'Terminated', variant: 'danger' },
}

export function Agreements() {
  const { user } = useAuth()
  const canCreate = user?.role === 'coordinator' || user?.role === 'site_manager' || user?.role === 'admin'
  const canManage = user?.role === 'site_manager' || user?.role === 'admin'

  const { data: agreementsData, isLoading } = useAgreements()
  const agreements = agreementsData?.agreements || []

  const { data: sitesData } = useMySites()
  const mySites = sitesData?.sites || []

  const { data: allSitesData } = useSites()
  const allSites = allSitesData?.data || []

  const { data: uniData } = useUniversities()
  const universities = uniData?.data || []

  const createMutation = useCreateAgreement()
  const updateMutation = useUpdateAgreement()
  const uploadMutation = useUploadAgreementDocument()

  const { data: templatesData } = useAgreementTemplates()
  const templates = (templatesData || []) as ApiAgreementTemplate[]
  const createTemplateMutation = useCreateAgreementTemplate()
  const deleteTemplateMutation = useDeleteAgreementTemplate()

  const [showTemplatesModal, setShowTemplatesModal] = useState(false)
  const [templateForm, setTemplateForm] = useState({ name: '', description: '', default_notes: '' })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedAgreement, setSelectedAgreement] = useState<ApiAgreement | null>(null)
  const fileInputRefs = useRef<Map<string, HTMLInputElement>>(new Map())

  // Create form state
  const [formData, setFormData] = useState({
    university_id: '',
    site_id: '',
    start_date: '',
    end_date: '',
    notes: '',
  })

  const filtered = useMemo(() => {
    return agreements.filter(a => {
      if (statusFilter !== 'all' && a.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          a.university?.name?.toLowerCase().includes(q) ||
          a.site?.name?.toLowerCase().includes(q) ||
          a.notes?.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [agreements, search, statusFilter])

  const stats = useMemo(() => ({
    total: agreements.length,
    active: agreements.filter(a => a.status === 'active').length,
    pending: agreements.filter(a => a.status === 'pending_review').length,
    expired: agreements.filter(a => a.status === 'expired').length,
  }), [agreements])

  const handleCreate = async () => {
    if (!formData.university_id || !formData.site_id) {
      toast.error('Please select both a university and a site.')
      return
    }
    try {
      await createMutation.mutateAsync({
        university_id: formData.university_id,
        site_id: formData.site_id,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        notes: formData.notes || undefined,
      })
      toast.success('Agreement created successfully.')
      setShowCreateModal(false)
      setFormData({ university_id: '', site_id: '', start_date: '', end_date: '', notes: '' })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create agreement.')
    }
  }

  const handleStatusChange = async (agreement: ApiAgreement, newStatus: string) => {
    try {
      await updateMutation.mutateAsync({ id: agreement.id, data: { status: newStatus } })
      toast.success(`Agreement status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}.`)
      setSelectedAgreement(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.')
    }
  }

  const handleFileUpload = async (agreementId: string, file: File) => {
    try {
      await uploadMutation.mutateAsync({ id: agreementId, file })
      toast.success('Document uploaded successfully.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to upload document.')
    }
  }

  const handleDownload = (agreementId: string) => {
    const token = localStorage.getItem('cliniclink_token')
    const url = agreementsApi.downloadUrl(agreementId)
    window.open(`${url}?token=${token}`, '_blank')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getStatusActions = (agreement: ApiAgreement) => {
    const actions: { label: string; status: string; variant: 'primary' | 'danger' | 'outline' }[] = []
    switch (agreement.status) {
      case 'draft':
        actions.push({ label: 'Submit for Review', status: 'pending_review', variant: 'primary' })
        break
      case 'pending_review':
        if (canManage) {
          actions.push({ label: 'Approve', status: 'active', variant: 'primary' })
        }
        actions.push({ label: 'Back to Draft', status: 'draft', variant: 'outline' })
        break
      case 'active':
        actions.push({ label: 'Mark Expired', status: 'expired', variant: 'danger' })
        actions.push({ label: 'Terminate', status: 'terminated', variant: 'danger' })
        break
      case 'expired':
        actions.push({ label: 'Reactivate', status: 'active', variant: 'primary' })
        break
    }
    return actions
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Affiliation Agreements</h1>
          <p className="text-stone-500 mt-1">Manage university-site affiliation agreements and documentation</p>
        </div>
        {canCreate && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowTemplatesModal(true)}>
              <FileText className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Agreement
            </Button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: FileText, color: 'text-stone-600' },
          { label: 'Active', value: stats.active, icon: Building2, color: 'text-green-600' },
          { label: 'Pending Review', value: stats.pending, icon: Calendar, color: 'text-amber-600' },
          { label: 'Expired', value: stats.expired, icon: FileText, color: 'text-red-600' },
        ].map(stat => (
          <Card key={stat.label} className="p-4">
            <div className="flex items-center gap-3">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
              <div>
                <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
                <p className="text-xs text-stone-500">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search by university or site name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="pending_review">Pending Review</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="terminated">Terminated</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Agreement List */}
      {filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <p className="text-stone-500 font-medium">No agreements found</p>
          <p className="text-sm text-stone-400 mt-1">
            {agreements.length === 0 ? 'Create your first affiliation agreement to get started.' : 'Try adjusting your filters.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(agreement => (
            <Card key={agreement.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedAgreement(agreement)}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <GraduationCap className="w-4 h-4 text-primary-500 shrink-0" />
                    <span className="font-semibold text-stone-900 truncate">{agreement.university?.name || 'Unknown University'}</span>
                    <span className="text-stone-400 mx-1">&harr;</span>
                    <Building2 className="w-4 h-4 text-secondary-500 shrink-0" />
                    <span className="font-semibold text-stone-900 truncate">{agreement.site?.name || 'Unknown Site'}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                    {agreement.start_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(agreement.start_date).toLocaleDateString()} – {agreement.end_date ? new Date(agreement.end_date).toLocaleDateString() : 'No end date'}
                      </span>
                    )}
                    {agreement.file_name && (
                      <span className="flex items-center gap-1">
                        <Paperclip className="w-3 h-3" />
                        {agreement.file_name}
                        {agreement.file_size && ` (${formatFileSize(agreement.file_size)})`}
                      </span>
                    )}
                    {agreement.creator && (
                      <span>Created by {agreement.creator.first_name} {agreement.creator.last_name}</span>
                    )}
                  </div>
                  {agreement.notes && (
                    <p className="text-xs text-stone-400 mt-1 truncate">{agreement.notes}</p>
                  )}
                </div>
                <Badge variant={STATUS_CONFIG[agreement.status]?.variant || 'default'}>
                  {STATUS_CONFIG[agreement.status]?.label || agreement.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} title="New Affiliation Agreement" onClose={() => setShowCreateModal(false)}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">University *</label>
              <select
                value={formData.university_id}
                onChange={e => setFormData(f => ({ ...f, university_id: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Select university...</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Clinical Site *</label>
              <select
                value={formData.site_id}
                onChange={e => setFormData(f => ({ ...f, site_id: e.target.value }))}
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Select site...</option>
                {(user?.role === 'site_manager' ? mySites : allSites).map(s => (
                  <option key={s.id} value={s.id}>{s.name} — {s.city}, {s.state}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={e => setFormData(f => ({ ...f, start_date: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={e => setFormData(f => ({ ...f, end_date: e.target.value }))}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                />
              </div>
            </div>

            {templates.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Use Template</label>
                <select
                  onChange={e => {
                    const tpl = templates.find(t => t.id === e.target.value)
                    if (tpl) setFormData(f => ({ ...f, notes: tpl.default_notes || '' }))
                  }}
                  className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  defaultValue=""
                >
                  <option value="">Select a template to prefill notes...</option>
                  {templates.map(t => <option key={t.id} value={t.id}>{t.name}{t.description ? ` — ${t.description}` : ''}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
                rows={3}
                placeholder="Additional notes about the agreement..."
                className="w-full border border-stone-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Agreement'}
              </Button>
            </div>
          </div>
        </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={!!selectedAgreement}
        title="Agreement Details"
        onClose={() => setSelectedAgreement(null)}
      >
          {selectedAgreement && <div className="space-y-5">
            {/* Parties */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-primary-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4 text-primary-600" />
                  <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">University</span>
                </div>
                <p className="font-semibold text-stone-900">{selectedAgreement.university?.name}</p>
                {selectedAgreement.university?.city && selectedAgreement.university?.state && (
                  <p className="text-xs text-stone-500">{selectedAgreement.university.city}, {selectedAgreement.university.state}</p>
                )}
              </div>
              <div className="p-3 bg-secondary-50 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-secondary-600" />
                  <span className="text-xs font-medium text-secondary-600 uppercase tracking-wide">Clinical Site</span>
                </div>
                <p className="font-semibold text-stone-900">{selectedAgreement.site?.name}</p>
                {selectedAgreement.site?.city && selectedAgreement.site?.state && (
                  <p className="text-xs text-stone-500">{selectedAgreement.site.city}, {selectedAgreement.site.state}</p>
                )}
              </div>
            </div>

            {/* Status & Dates */}
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={STATUS_CONFIG[selectedAgreement.status]?.variant || 'default'}>
                {STATUS_CONFIG[selectedAgreement.status]?.label || selectedAgreement.status}
              </Badge>
              {selectedAgreement.start_date && (
                <span className="text-sm text-stone-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(selectedAgreement.start_date).toLocaleDateString()}
                  {selectedAgreement.end_date && ` – ${new Date(selectedAgreement.end_date).toLocaleDateString()}`}
                </span>
              )}
            </div>

            {/* Notes */}
            {selectedAgreement.notes && (
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-1">Notes</p>
                <p className="text-sm text-stone-700 whitespace-pre-wrap">{selectedAgreement.notes}</p>
              </div>
            )}

            {/* Document */}
            <div>
              <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Document</p>
              {selectedAgreement.file_name ? (
                <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <Paperclip className="w-4 h-4 text-stone-400 shrink-0" />
                    <span className="text-sm text-stone-700 truncate">{selectedAgreement.file_name}</span>
                    {selectedAgreement.file_size && (
                      <span className="text-xs text-stone-400 shrink-0">({formatFileSize(selectedAgreement.file_size)})</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleDownload(selectedAgreement.id)}
                      className="text-primary-600 hover:text-primary-700 p-1"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    {canCreate && (
                      <>
                        <button
                          onClick={() => fileInputRefs.current.get(selectedAgreement.id)?.click()}
                          className="text-xs text-stone-500 hover:text-stone-700"
                        >
                          Replace
                        </button>
                        <input
                          type="file"
                          ref={el => { if (el) fileInputRefs.current.set(selectedAgreement.id, el) }}
                          onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) handleFileUpload(selectedAgreement.id, file)
                            e.target.value = ''
                          }}
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                        />
                      </>
                    )}
                  </div>
                </div>
              ) : canCreate ? (
                <div>
                  <button
                    onClick={() => fileInputRefs.current.get(selectedAgreement.id)?.click()}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 border border-dashed border-primary-300 rounded-xl hover:bg-primary-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Document
                  </button>
                  <input
                    type="file"
                    ref={el => { if (el) fileInputRefs.current.set(selectedAgreement.id, el) }}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) handleFileUpload(selectedAgreement.id, file)
                      e.target.value = ''
                    }}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    className="hidden"
                  />
                </div>
              ) : (
                <p className="text-sm text-stone-400 italic">No document attached</p>
              )}
            </div>

            {/* Status Actions */}
            {canCreate && (
              <div>
                <p className="text-xs font-medium text-stone-500 uppercase tracking-wide mb-2">Actions</p>
                <div className="flex flex-wrap gap-2">
                  {getStatusActions(selectedAgreement).map(action => (
                    <Button
                      key={action.status}
                      variant={action.variant}
                      size="sm"
                      onClick={() => handleStatusChange(selectedAgreement, action.status)}
                      disabled={updateMutation.isPending}
                    >
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>}
        </Modal>

      {/* Templates Management Modal */}
      <Modal isOpen={showTemplatesModal} title="Agreement Templates" onClose={() => setShowTemplatesModal(false)}>
        <div className="space-y-4">
          <div className="bg-stone-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-medium text-stone-900">Create Template</p>
            <input
              type="text"
              value={templateForm.name}
              onChange={e => setTemplateForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Template name..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            <input
              type="text"
              value={templateForm.description}
              onChange={e => setTemplateForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description (optional)..."
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            <textarea
              value={templateForm.default_notes}
              onChange={e => setTemplateForm(f => ({ ...f, default_notes: e.target.value }))}
              placeholder="Default notes to prefill when using this template..."
              rows={3}
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
            <Button
              size="sm"
              onClick={() => {
                if (!templateForm.name) { toast.error('Template name is required'); return }
                createTemplateMutation.mutate(templateForm, {
                  onSuccess: () => { toast.success('Template created'); setTemplateForm({ name: '', description: '', default_notes: '' }) },
                  onError: (err: Error) => toast.error(err.message),
                })
              }}
              disabled={createTemplateMutation.isPending}
            >
              <Plus className="w-4 h-4" /> Create Template
            </Button>
          </div>

          <div className="divide-y divide-stone-100">
            {templates.length === 0 ? (
              <p className="text-sm text-stone-400 py-4 text-center">No templates yet. Create one above.</p>
            ) : templates.map(t => (
              <div key={t.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900">{t.name}</p>
                  {t.description && <p className="text-xs text-stone-500">{t.description}</p>}
                  {t.default_notes && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{t.default_notes}</p>}
                </div>
                <button
                  onClick={() => deleteTemplateMutation.mutate(t.id, { onSuccess: () => toast.success('Template deleted') })}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0"
                  title="Delete template"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  )
}
