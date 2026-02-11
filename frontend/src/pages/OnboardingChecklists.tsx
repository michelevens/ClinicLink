import { useState, useMemo } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Input } from '../components/ui/Input.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useAuth } from '../contexts/AuthContext.tsx'
import {
  useOnboardingTemplates, useCreateOnboardingTemplate, useUpdateOnboardingTemplate, useDeleteOnboardingTemplate,
  useOnboardingTasks, useCompleteTask, useUncompleteTask, useVerifyTask, useUnverifyTask,
  useMySites, useApplications, useUploadTaskFile,
} from '../hooks/useApi.ts'
import type { ApiOnboardingTemplate, ApiOnboardingTask, ApiApplication } from '../services/api.ts'
import { onboardingTasksApi } from '../services/api.ts'
import { toast } from 'sonner'
import {
  ClipboardList, Plus, Trash2, Edit3, CheckCircle, Circle,
  Shield, ChevronDown, ChevronUp, Loader2, Inbox, GripVertical,
  Building2, User, Upload, Download, Paperclip,
} from 'lucide-react'

// ─── Site Manager: Templates Tab ──────────────────────────────────────

function TemplatesTab() {
  const { data: templateData, isLoading } = useOnboardingTemplates()
  const { data: sitesData } = useMySites()
  const createTemplate = useCreateOnboardingTemplate()
  const updateTemplate = useUpdateOnboardingTemplate()
  const deleteTemplate = useDeleteOnboardingTemplate()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editTemplate, setEditTemplate] = useState<ApiOnboardingTemplate | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ApiOnboardingTemplate | null>(null)

  const templates = templateData?.templates ?? []
  const sites = sitesData?.sites ?? []

  // Form state
  const [formSiteId, setFormSiteId] = useState('')
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [formItems, setFormItems] = useState<Array<{ title: string; description: string; is_required: boolean }>>([
    { title: '', description: '', is_required: true },
  ])

  function resetForm() {
    setFormSiteId(sites[0]?.id || '')
    setFormName('')
    setFormDescription('')
    setFormActive(true)
    setFormItems([{ title: '', description: '', is_required: true }])
  }

  function openCreate() {
    resetForm()
    if (sites.length > 0) setFormSiteId(sites[0].id)
    setShowCreateModal(true)
  }

  function openEdit(t: ApiOnboardingTemplate) {
    setFormSiteId(t.site_id)
    setFormName(t.name)
    setFormDescription(t.description || '')
    setFormActive(t.is_active)
    setFormItems(
      t.items?.map(i => ({ title: i.title, description: i.description || '', is_required: i.is_required })) ||
      [{ title: '', description: '', is_required: true }]
    )
    setEditTemplate(t)
  }

  function addItem() {
    setFormItems([...formItems, { title: '', description: '', is_required: true }])
  }

  function removeItem(index: number) {
    if (formItems.length <= 1) return
    setFormItems(formItems.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: string, value: string | boolean) {
    setFormItems(formItems.map((item, i) => i === index ? { ...item, [field]: value } : item))
  }

  async function handleSave() {
    const validItems = formItems.filter(i => i.title.trim())
    if (!formName.trim() || validItems.length === 0) {
      toast.error('Please provide a template name and at least one item')
      return
    }

    try {
      if (editTemplate) {
        await updateTemplate.mutateAsync({
          id: editTemplate.id,
          data: { name: formName, description: formDescription || undefined, is_active: formActive, items: validItems },
        })
        toast.success('Template updated')
        setEditTemplate(null)
      } else {
        await createTemplate.mutateAsync({
          site_id: formSiteId,
          name: formName,
          description: formDescription || undefined,
          is_active: formActive,
          items: validItems,
        })
        toast.success('Template created')
        setShowCreateModal(false)
      }
    } catch {
      toast.error('Failed to save template')
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try {
      await deleteTemplate.mutateAsync(deleteTarget.id)
      toast.success('Template deleted')
      setDeleteTarget(null)
    } catch {
      toast.error('Failed to delete template')
    }
  }

  const formFields = (
    <div className="space-y-4">
      {!editTemplate && (
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Site</label>
          <select
            value={formSiteId}
            onChange={e => setFormSiteId(e.target.value)}
            className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
      <Input label="Template Name" value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g., Main Campus Onboarding" />
      <Input label="Description (optional)" value={formDescription} onChange={e => setFormDescription(e.target.value)} placeholder="Brief description of this checklist" />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={formActive} onChange={e => setFormActive(e.target.checked)} className="rounded border-stone-300" />
        <span className="font-medium text-stone-700">Active</span>
        <span className="text-stone-500">(will be used for new accepted applications)</span>
      </label>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-stone-700">Checklist Items</label>
          <button onClick={addItem} className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Item
          </button>
        </div>
        <div className="space-y-3">
          {formItems.map((item, index) => (
            <div key={index} className="flex gap-2 items-start bg-stone-50 rounded-xl p-3 border border-stone-200">
              <GripVertical className="w-4 h-4 text-stone-400 mt-2.5 shrink-0" />
              <div className="flex-1 space-y-2">
                <input
                  value={item.title}
                  onChange={e => updateItem(index, 'title', e.target.value)}
                  placeholder={`Item ${index + 1} title (e.g., Complete HIPAA Training)`}
                  className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <input
                  value={item.description}
                  onChange={e => updateItem(index, 'description', e.target.value)}
                  placeholder="Optional description or instructions"
                  className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
                />
                <label className="flex items-center gap-1.5 text-xs">
                  <input
                    type="checkbox"
                    checked={item.is_required}
                    onChange={e => updateItem(index, 'is_required', e.target.checked)}
                    className="rounded border-stone-300"
                  />
                  <span className="text-stone-600">Required</span>
                </label>
              </div>
              <button onClick={() => removeItem(index)} className="p-1 text-stone-400 hover:text-red-500 mt-2" disabled={formItems.length <= 1}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-stone-500">{templates.length} template{templates.length !== 1 ? 's' : ''}</p>
        <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> New Template</Button>
      </div>

      {templates.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-semibold text-stone-900 mb-1">No onboarding templates</h3>
            <p className="text-sm text-stone-500 mb-4">Create a checklist template for your site</p>
            <Button onClick={openCreate} size="sm"><Plus className="w-4 h-4 mr-1" /> Create Template</Button>
          </div>
        </Card>
      ) : (
        templates.map(t => (
          <Card key={t.id} hover>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-stone-900">{t.name}</h3>
                  {t.is_active ? <Badge variant="success" size="sm">Active</Badge> : <Badge size="sm">Inactive</Badge>}
                </div>
                {t.site && <p className="text-xs text-stone-500 flex items-center gap-1"><Building2 className="w-3 h-3" /> {t.site.name}</p>}
                {t.description && <p className="text-sm text-stone-600 mt-1">{t.description}</p>}
                <p className="text-xs text-stone-400 mt-2">{t.items?.length || 0} items ({t.items?.filter(i => i.is_required).length || 0} required)</p>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(t)} className="p-2 text-stone-400 hover:text-primary-600 rounded-lg hover:bg-primary-50">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(t)} className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Onboarding Template" size="lg">
        {formFields}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={createTemplate.isPending}>Create Template</Button>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editTemplate} onClose={() => setEditTemplate(null)} title="Edit Onboarding Template" size="lg">
        {formFields}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setEditTemplate(null)}>Cancel</Button>
          <Button onClick={handleSave} isLoading={updateTemplate.isPending}>Save Changes</Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Template" size="sm">
        <p className="text-sm text-stone-600">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This will not affect existing student onboarding tasks.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} isLoading={deleteTemplate.isPending}>Delete</Button>
        </div>
      </Modal>
    </div>
  )
}

// ─── Site Manager: Student Progress Tab ───────────────────────────────

function StudentProgressTab() {
  const { data: tasksData, isLoading } = useOnboardingTasks()
  const verifyTask = useVerifyTask()
  const unverifyTask = useUnverifyTask()
  const [expandedApp, setExpandedApp] = useState<string | null>(null)

  const tasks = tasksData?.tasks ?? []

  // Group tasks by application
  const groupedByApp = useMemo(() => {
    const groups: Record<string, { application: ApiOnboardingTask['application']; tasks: ApiOnboardingTask[] }> = {}
    for (const task of tasks) {
      const appId = task.application_id
      if (!groups[appId]) {
        groups[appId] = { application: task.application, tasks: [] }
      }
      groups[appId].tasks.push(task)
    }
    return Object.entries(groups)
  }, [tasks])

  async function handleVerify(taskId: string) {
    try {
      await verifyTask.mutateAsync({ id: taskId, data: {} })
      toast.success('Task verified')
    } catch {
      toast.error('Failed to verify task')
    }
  }

  async function handleUnverify(taskId: string) {
    try {
      await unverifyTask.mutateAsync(taskId)
      toast.success('Verification removed')
    } catch {
      toast.error('Failed to unverify task')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
  }

  if (groupedByApp.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-semibold text-stone-900 mb-1">No student onboarding tasks</h3>
          <p className="text-sm text-stone-500">Tasks will appear here when students are accepted to rotations with an active template</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {groupedByApp.map(([appId, group]) => {
        const app = group.application
        const requiredTasks = group.tasks.filter(t => t.is_required)
        const completedRequired = requiredTasks.filter(t => t.completed_at)
        const verifiedRequired = requiredTasks.filter(t => t.verified_at)
        const progress = requiredTasks.length > 0 ? Math.round((completedRequired.length / requiredTasks.length) * 100) : 100
        const isExpanded = expandedApp === appId

        return (
          <Card key={appId}>
            <button onClick={() => setExpandedApp(isExpanded ? null : appId)} className="w-full text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                    {app?.student?.first_name?.[0]}{app?.student?.last_name?.[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900 text-sm">{app?.student?.first_name} {app?.student?.last_name}</h3>
                    <p className="text-xs text-stone-500">{app?.slot?.site?.name} — {app?.slot?.title || app?.slot?.specialty}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-sm font-semibold text-stone-900">{progress}%</div>
                    <div className="text-xs text-stone-500">{verifiedRequired.length}/{requiredTasks.length} verified</div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </div>
              <div className="mt-2 w-full bg-stone-200 rounded-full h-1.5">
                <div className="bg-primary-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </button>

            {isExpanded && (
              <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                {group.tasks.map(task => (
                  <div key={task.id} className={`flex items-center justify-between p-3 rounded-xl border ${task.verified_at ? 'bg-green-50 border-green-200' : task.completed_at ? 'bg-amber-50 border-amber-200' : 'bg-stone-50 border-stone-200'}`}>
                    <div className="flex items-center gap-3">
                      {task.verified_at ? (
                        <Shield className="w-5 h-5 text-green-500" />
                      ) : task.completed_at ? (
                        <CheckCircle className="w-5 h-5 text-amber-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-stone-900">{task.title}</p>
                        {task.description && <p className="text-xs text-stone-500">{task.description}</p>}
                        <div className="flex items-center gap-2 mt-0.5">
                          {task.is_required && <Badge variant="warning" size="sm">Required</Badge>}
                          {task.verified_at && <Badge variant="success" size="sm">Verified</Badge>}
                          {task.completed_at && !task.verified_at && <Badge variant="primary" size="sm">Completed</Badge>}
                        </div>
                        {task.file_name && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <Paperclip className="w-3 h-3 text-stone-400" />
                            <a
                              href={onboardingTasksApi.downloadFileUrl(task.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> {task.file_name}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      {task.completed_at && !task.verified_at && (
                        <Button size="sm" onClick={() => handleVerify(task.id)} isLoading={verifyTask.isPending}>
                          <Shield className="w-3.5 h-3.5 mr-1" /> Verify
                        </Button>
                      )}
                      {task.verified_at && (
                        <button onClick={() => handleUnverify(task.id)} className="text-xs text-stone-500 hover:text-red-500">
                          Undo
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ─── Student View ─────────────────────────────────────────────────────

function StudentOnboardingView() {
  const { data: tasksData, isLoading } = useOnboardingTasks()
  const { data: appsData } = useApplications()
  const completeTask = useCompleteTask()
  const uncompleteTask = useUncompleteTask()
  const uploadTaskFile = useUploadTaskFile()
  const [expandedApp, setExpandedApp] = useState<string | null>(null)
  const fileInputRefs = new Map<string, HTMLInputElement>()

  const tasks = tasksData?.tasks ?? []
  const applications = (appsData?.data ?? []).filter((a: ApiApplication) => a.status === 'accepted')

  // Group tasks by application
  const groupedByApp = useMemo(() => {
    const groups: Record<string, ApiOnboardingTask[]> = {}
    for (const task of tasks) {
      if (!groups[task.application_id]) groups[task.application_id] = []
      groups[task.application_id].push(task)
    }
    return groups
  }, [tasks])

  async function handleToggle(task: ApiOnboardingTask) {
    try {
      if (task.completed_at) {
        await uncompleteTask.mutateAsync(task.id)
      } else {
        await completeTask.mutateAsync(task.id)
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to update task'
      toast.error(msg)
    }
  }

  async function handleFileUpload(taskId: string, file: File) {
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large. Maximum size is 20MB.')
      return
    }
    try {
      await uploadTaskFile.mutateAsync({ taskId, file })
      toast.success('File uploaded')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to upload'
      toast.error(msg)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary-500" /></div>
  }

  if (applications.length === 0) {
    return (
      <Card>
        <div className="text-center py-12">
          <Inbox className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-semibold text-stone-900 mb-1">No onboarding checklists</h3>
          <p className="text-sm text-stone-500">Checklists will appear here after your rotation application is accepted</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map(app => {
        const appTasks = groupedByApp[app.id] || []
        const requiredTasks = appTasks.filter(t => t.is_required)
        const completedRequired = requiredTasks.filter(t => t.completed_at)
        const progress = requiredTasks.length > 0 ? Math.round((completedRequired.length / requiredTasks.length) * 100) : 100
        const isExpanded = expandedApp === app.id
        const allDone = requiredTasks.length > 0 && completedRequired.length === requiredTasks.length

        return (
          <Card key={app.id}>
            <button onClick={() => setExpandedApp(isExpanded ? null : app.id)} className="w-full text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-stone-900">{app.slot?.title || app.slot?.specialty}</h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1">
                    <Building2 className="w-3 h-3" /> {app.slot?.site?.name}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {appTasks.length === 0 ? (
                    <Badge size="sm">No checklist</Badge>
                  ) : allDone ? (
                    <Badge variant="success" size="sm">Complete</Badge>
                  ) : (
                    <span className="text-sm font-semibold text-primary-600">{progress}%</span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-stone-400" /> : <ChevronDown className="w-4 h-4 text-stone-400" />}
                </div>
              </div>
              {appTasks.length > 0 && (
                <div className="mt-2 w-full bg-stone-200 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${allDone ? 'bg-green-500' : 'bg-primary-500'}`} style={{ width: `${progress}%` }} />
                </div>
              )}
            </button>

            {isExpanded && appTasks.length > 0 && (
              <div className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                {appTasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                      task.verified_at ? 'bg-green-50 border-green-200' : task.completed_at ? 'bg-primary-50 border-primary-200' : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <button
                      onClick={() => handleToggle(task)}
                      disabled={!!task.verified_at || completeTask.isPending || uncompleteTask.isPending}
                      className="shrink-0"
                    >
                      {task.verified_at ? (
                        <Shield className="w-5 h-5 text-green-500" />
                      ) : task.completed_at ? (
                        <CheckCircle className="w-5 h-5 text-primary-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-stone-300 hover:text-primary-400" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${task.completed_at ? 'text-stone-500 line-through' : 'text-stone-900'}`}>
                        {task.title}
                      </p>
                      {task.description && <p className="text-xs text-stone-500 mt-0.5">{task.description}</p>}
                      <div className="flex items-center gap-2 mt-1">
                        {task.is_required && <Badge variant="warning" size="sm">Required</Badge>}
                        {task.verified_at && <span className="text-[11px] text-green-600">Verified by site</span>}
                        {task.completed_at && !task.verified_at && (
                          <span className="text-[11px] text-stone-400">
                            Completed {new Date(task.completed_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {/* File upload/download */}
                      <div className="mt-1.5">
                        {task.file_name ? (
                          <div className="flex items-center gap-1.5">
                            <Paperclip className="w-3 h-3 text-stone-400" />
                            <a
                              href={onboardingTasksApi.downloadFileUrl(task.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" /> {task.file_name}
                            </a>
                            {!task.verified_at && (
                              <button
                                onClick={(e) => { e.stopPropagation(); fileInputRefs.get(task.id)?.click() }}
                                className="text-xs text-stone-500 hover:text-stone-700 ml-1"
                              >
                                Replace
                              </button>
                            )}
                          </div>
                        ) : !task.verified_at ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); fileInputRefs.get(task.id)?.click() }}
                            disabled={uploadTaskFile.isPending}
                            className="inline-flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium py-0.5 px-1.5 rounded hover:bg-primary-50 transition-colors disabled:opacity-50"
                          >
                            {uploadTaskFile.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                            Attach file
                          </button>
                        ) : null}
                        <input
                          ref={el => { if (el) fileInputRefs.set(task.id, el) }}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          className="hidden"
                          onChange={e => {
                            if (e.target.files?.[0]) {
                              handleFileUpload(task.id, e.target.files[0])
                              e.target.value = ''
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {isExpanded && appTasks.length === 0 && (
              <div className="mt-4 border-t border-stone-100 pt-4 text-center text-sm text-stone-400">
                No onboarding checklist for this rotation
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────

export function OnboardingChecklists() {
  const { user } = useAuth()
  const isSiteManager = user?.role === 'site_manager' || user?.role === 'admin'
  const [tab, setTab] = useState<'templates' | 'progress'>('templates')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Onboarding</h1>
        <p className="text-sm text-stone-500 mt-1">
          {isSiteManager
            ? 'Manage onboarding checklists and verify student completion'
            : 'Complete your onboarding requirements before starting rotations'}
        </p>
      </div>

      {isSiteManager ? (
        <>
          {/* Tabs */}
          <div className="flex gap-1 bg-stone-100 rounded-xl p-1 w-fit">
            <button
              onClick={() => setTab('templates')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'templates' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
            >
              <ClipboardList className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Templates
            </button>
            <button
              onClick={() => setTab('progress')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'progress' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
            >
              <User className="w-4 h-4 inline mr-1.5 -mt-0.5" />
              Student Progress
            </button>
          </div>

          {tab === 'templates' ? <TemplatesTab /> : <StudentProgressTab />}
        </>
      ) : (
        <StudentOnboardingView />
      )}
    </div>
  )
}
