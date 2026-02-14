import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useEvaluationTemplates, useCreateEvaluationTemplate, useUpdateEvaluationTemplate, useDeleteEvaluationTemplate, useUniversities } from '../hooks/useApi.ts'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, GripVertical, X, FileCheck } from 'lucide-react'
import type { ApiEvaluationTemplate } from '../services/api.ts'

const PRESET_CATEGORIES = [
  'Clinical Skills',
  'Professionalism',
  'Communication',
  'Critical Thinking',
  'Patient Care',
  'Medical Knowledge',
  'Practice-Based Learning',
  'Systems-Based Practice',
  'Interpersonal Skills',
  'Documentation',
  'Clinical Judgment',
  'Time Management',
  'Teamwork & Collaboration',
  'Ethics & Integrity',
  'Patient Safety',
  'Cultural Competency',
  'Leadership',
  'Problem Solving',
  'Evidence-Based Practice',
  'Self-Directed Learning',
  'Technical Competence',
  'Empathy & Compassion',
  'Adaptability',
  'Accountability',
  'Initiative',
]

const typeLabels: Record<string, string> = {
  mid_rotation: 'Mid-Rotation',
  final: 'Final',
  student_feedback: 'Student Feedback',
}

interface CategoryForm {
  key: string
  label: string
  description: string
  weight: string
}

export function EvaluationTemplates() {
  const [selectedUni, setSelectedUni] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { data: templates, isLoading } = useEvaluationTemplates({
    university_id: selectedUni || undefined,
    type: typeFilter || undefined,
  })
  const { data: uniData } = useUniversities()
  const universities = uniData?.data || []

  const createMutation = useCreateEvaluationTemplate()
  const updateMutation = useUpdateEvaluationTemplate()
  const deleteMutation = useDeleteEvaluationTemplate()

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<ApiEvaluationTemplate | null>(null)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('mid_rotation')
  const [formUniId, setFormUniId] = useState('')
  const [formCategories, setFormCategories] = useState<CategoryForm[]>([
    { key: 'clinical_skills', label: 'Clinical Skills', description: '', weight: '' },
    { key: 'professionalism', label: 'Professionalism', description: '', weight: '' },
    { key: 'communication', label: 'Communication', description: '', weight: '' },
  ])

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormType('mid_rotation')
    setFormUniId(selectedUni || '')
    setFormCategories([
      { key: 'clinical_skills', label: 'Clinical Skills', description: '', weight: '' },
      { key: 'professionalism', label: 'Professionalism', description: '', weight: '' },
      { key: 'communication', label: 'Communication', description: '', weight: '' },
    ])
    setShowForm(true)
  }

  const openEdit = (t: ApiEvaluationTemplate) => {
    setEditing(t)
    setFormName(t.name)
    setFormType(t.type)
    setFormUniId(t.university_id)
    setFormCategories(
      t.categories.map(c => ({
        key: c.key,
        label: c.label,
        description: c.description || '',
        weight: c.weight != null ? String(c.weight) : '',
      }))
    )
    setShowForm(true)
  }

  const addCategory = () => {
    const key = `category_${formCategories.length + 1}`
    setFormCategories([...formCategories, { key, label: '', description: '', weight: '' }])
  }

  const removeCategory = (idx: number) => {
    setFormCategories(formCategories.filter((_, i) => i !== idx))
  }

  const updateCategory = (idx: number, field: keyof CategoryForm, value: string) => {
    setFormCategories(formCategories.map((c, i) => {
      if (i !== idx) return c
      const updated = { ...c, [field]: value }
      if (field === 'label') {
        updated.key = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      }
      return updated
    }))
  }

  const handleSubmit = () => {
    if (!formName || !formUniId || formCategories.some(c => !c.label)) {
      toast.error('Please fill in all required fields')
      return
    }
    const cats = formCategories.map(c => ({
      key: c.key,
      label: c.label,
      description: c.description || undefined,
      weight: c.weight ? Number(c.weight) : undefined,
    }))

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: { name: formName, categories: cats } },
        {
          onSuccess: () => { toast.success('Template updated'); setShowForm(false) },
          onError: (err: Error) => toast.error(err.message),
        }
      )
    } else {
      createMutation.mutate(
        { university_id: formUniId, type: formType, name: formName, categories: cats },
        {
          onSuccess: () => { toast.success('Template created'); setShowForm(false) },
          onError: (err: Error) => toast.error(err.message),
        }
      )
    }
  }

  const handleDelete = (id: string) => {
    if (!confirm('Delete this template?')) return
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Template deleted'),
      onError: (err: Error) => toast.error(err.message),
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Evaluation Templates</h1>
          <p className="text-stone-500">Manage custom evaluation rating categories per university</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" /> New Template</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedUni}
            onChange={e => setSelectedUni(e.target.value)}
            className="rounded-xl border border-stone-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="">All Universities</option>
            {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="rounded-xl border border-stone-300 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
          >
            <option value="">All Types</option>
            <option value="mid_rotation">Mid-Rotation</option>
            <option value="final">Final</option>
            <option value="student_feedback">Student Feedback</option>
          </select>
        </div>
      </Card>

      {/* Templates */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
      ) : !templates || templates.length === 0 ? (
        <Card className="text-center py-12">
          <FileCheck className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-700 mb-2">No templates found</h3>
          <p className="text-stone-500">Create a template to customize evaluation categories</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {templates.map((t: ApiEvaluationTemplate) => (
            <Card key={t.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-stone-900">{t.name}</h3>
                    <Badge variant={t.is_active ? 'success' : 'default'} size="sm">
                      {t.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="primary" size="sm">{typeLabels[t.type] || t.type}</Badge>
                  </div>
                  <p className="text-sm text-stone-500 mb-3">{t.university?.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.categories.map(c => (
                      <span key={c.key} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-lg">
                        {c.label}{c.weight ? ` (${c.weight}%)` : ''}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-500 hover:text-red-600 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Template' : 'New Evaluation Template'} size="xl">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Template Name *</label>
              <input
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Standard Mid-Rotation"
                className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
              />
            </div>
            {!editing && (
              <>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Type *</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  >
                    <option value="mid_rotation">Mid-Rotation</option>
                    <option value="final">Final</option>
                    <option value="student_feedback">Student Feedback</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-stone-700 mb-1">University *</label>
                  <select
                    value={formUniId}
                    onChange={e => setFormUniId(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 px-3 py-2.5 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  >
                    <option value="">Select university...</option>
                    {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-stone-700">Rating Categories *</label>
              <Button size="sm" variant="outline" onClick={addCategory}><Plus className="w-3 h-3" /> Add</Button>
            </div>
            <div className="space-y-2">
              {formCategories.map((cat, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-stone-50 rounded-xl p-3">
                  <GripVertical className="w-4 h-4 text-stone-400 mt-2.5 shrink-0" />
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {PRESET_CATEGORIES.includes(cat.label) || cat.label === '' ? (
                      <select
                        value={cat.label}
                        onChange={e => {
                          if (e.target.value === '__other__') {
                            updateCategory(idx, 'label', '')
                            // Mark as custom by setting a temporary flag via key
                            setFormCategories(prev => prev.map((c, i) => i === idx ? { ...c, key: '__custom__', label: '' } : c))
                          } else {
                            updateCategory(idx, 'label', e.target.value)
                          }
                        }}
                        className="rounded-lg border border-stone-200 px-3 py-2 text-sm bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                      >
                        <option value="">Select category...</option>
                        {PRESET_CATEGORIES.filter(p => p === cat.label || !formCategories.some(fc => fc.label === p)).map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                        <option value="__other__">Other (custom)...</option>
                      </select>
                    ) : (
                      <div className="flex gap-1">
                        <input
                          value={cat.label}
                          onChange={e => updateCategory(idx, 'label', e.target.value)}
                          placeholder="Custom category name *"
                          className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => updateCategory(idx, 'label', '')}
                          className="px-2 py-1 text-xs text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors shrink-0"
                          title="Switch back to preset list"
                        >
                          Presets
                        </button>
                      </div>
                    )}
                    <input
                      value={cat.description}
                      onChange={e => updateCategory(idx, 'description', e.target.value)}
                      placeholder="Description (optional)"
                      className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                    />
                    <input
                      value={cat.weight}
                      onChange={e => updateCategory(idx, 'weight', e.target.value)}
                      placeholder="Weight % (optional)"
                      type="number"
                      min="0"
                      max="100"
                      className="rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                    />
                  </div>
                  {formCategories.length > 1 && (
                    <button onClick={() => removeCategory(idx)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 mt-1.5">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              {editing ? 'Update Template' : 'Create Template'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
