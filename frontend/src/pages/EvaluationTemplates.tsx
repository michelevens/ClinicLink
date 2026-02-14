import { useState } from 'react'
import { Card } from '../components/ui/Card.tsx'
import { Button } from '../components/ui/Button.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Modal } from '../components/ui/Modal.tsx'
import { useEvaluationTemplates, useCreateEvaluationTemplate, useUpdateEvaluationTemplate, useDeleteEvaluationTemplate, useUniversities } from '../hooks/useApi.ts'
import { toast } from 'sonner'
import { Plus, Pencil, Trash2, Loader2, GripVertical, X, FileCheck, Copy, Eye, ChevronDown, ChevronRight } from 'lucide-react'
import type { ApiEvaluationTemplate, ApiRatingScaleLevel } from '../services/api.ts'

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

const RATING_SCALE_PRESETS: Record<string, ApiRatingScaleLevel[]> = {
  '3': [
    { value: 1, label: 'Below Expectations', description: 'Does not meet minimum standards' },
    { value: 2, label: 'Meets Expectations', description: 'Meets expected competency level' },
    { value: 3, label: 'Exceeds Expectations', description: 'Demonstrates advanced competency' },
  ],
  '4': [
    { value: 1, label: 'Unsatisfactory', description: 'Fails to meet requirements' },
    { value: 2, label: 'Developing', description: 'Progressing but not yet competent' },
    { value: 3, label: 'Competent', description: 'Meets expected standards' },
    { value: 4, label: 'Exceptional', description: 'Consistently exceeds standards' },
  ],
  '5': [
    { value: 1, label: 'Poor', description: 'Significant improvement needed' },
    { value: 2, label: 'Below Average', description: 'Does not consistently meet expectations' },
    { value: 3, label: 'Average', description: 'Meets expectations' },
    { value: 4, label: 'Above Average', description: 'Frequently exceeds expectations' },
    { value: 5, label: 'Outstanding', description: 'Consistently exceptional performance' },
  ],
  '10': Array.from({ length: 10 }, (_, i) => ({
    value: i + 1,
    label: `${i + 1}`,
    description: i === 0 ? 'Lowest' : i === 9 ? 'Highest' : undefined,
  })),
}

interface CriterionForm {
  key: string
  label: string
  description: string
}

interface CategoryForm {
  key: string
  label: string
  description: string
  weight: string
  criteria: CriterionForm[]
  expanded: boolean
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
  const [showPreview, setShowPreview] = useState(false)
  const [editing, setEditing] = useState<ApiEvaluationTemplate | null>(null)
  const [formName, setFormName] = useState('')
  const [formType, setFormType] = useState('mid_rotation')
  const [formUniId, setFormUniId] = useState('')
  const [formCategories, setFormCategories] = useState<CategoryForm[]>([])
  const [formRatingScale, setFormRatingScale] = useState<ApiRatingScaleLevel[]>(RATING_SCALE_PRESETS['5'])
  const [ratingPreset, setRatingPreset] = useState('5')

  const defaultCategories = (): CategoryForm[] => [
    { key: 'clinical_skills', label: 'Clinical Skills', description: '', weight: '', criteria: [], expanded: false },
    { key: 'professionalism', label: 'Professionalism', description: '', weight: '', criteria: [], expanded: false },
    { key: 'communication', label: 'Communication', description: '', weight: '', criteria: [], expanded: false },
  ]

  const openCreate = () => {
    setEditing(null)
    setFormName('')
    setFormType('mid_rotation')
    setFormUniId(selectedUni || '')
    setFormCategories(defaultCategories())
    setFormRatingScale(RATING_SCALE_PRESETS['5'])
    setRatingPreset('5')
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
        criteria: (c.criteria || []).map(cr => ({ key: cr.key, label: cr.label, description: cr.description || '' })),
        expanded: false,
      }))
    )
    setFormRatingScale(t.rating_scale || RATING_SCALE_PRESETS['5'])
    setRatingPreset(t.rating_scale ? 'custom' : '5')
    setShowForm(true)
  }

  const openDuplicate = (t: ApiEvaluationTemplate) => {
    setEditing(null)
    setFormName(`${t.name} (Copy)`)
    setFormType(t.type)
    setFormUniId(t.university_id)
    setFormCategories(
      t.categories.map(c => ({
        key: c.key,
        label: c.label,
        description: c.description || '',
        weight: c.weight != null ? String(c.weight) : '',
        criteria: (c.criteria || []).map(cr => ({ key: cr.key, label: cr.label, description: cr.description || '' })),
        expanded: false,
      }))
    )
    setFormRatingScale(t.rating_scale || RATING_SCALE_PRESETS['5'])
    setRatingPreset(t.rating_scale ? 'custom' : '5')
    setShowForm(true)
  }

  const addCategory = () => {
    const key = `category_${formCategories.length + 1}`
    setFormCategories([...formCategories, { key, label: '', description: '', weight: '', criteria: [], expanded: false }])
  }

  const removeCategory = (idx: number) => {
    setFormCategories(formCategories.filter((_, i) => i !== idx))
  }

  const updateCategory = (idx: number, field: keyof Omit<CategoryForm, 'criteria' | 'expanded'>, value: string) => {
    setFormCategories(formCategories.map((c, i) => {
      if (i !== idx) return c
      const updated = { ...c, [field]: value }
      if (field === 'label') {
        updated.key = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
      }
      return updated
    }))
  }

  const toggleCategoryExpand = (idx: number) => {
    setFormCategories(formCategories.map((c, i) => i === idx ? { ...c, expanded: !c.expanded } : c))
  }

  const addCriterion = (catIdx: number) => {
    setFormCategories(formCategories.map((c, i) => {
      if (i !== catIdx) return c
      const key = `criterion_${c.criteria.length + 1}`
      return { ...c, criteria: [...c.criteria, { key, label: '', description: '' }], expanded: true }
    }))
  }

  const removeCriterion = (catIdx: number, crIdx: number) => {
    setFormCategories(formCategories.map((c, i) => {
      if (i !== catIdx) return c
      return { ...c, criteria: c.criteria.filter((_, j) => j !== crIdx) }
    }))
  }

  const updateCriterion = (catIdx: number, crIdx: number, field: keyof CriterionForm, value: string) => {
    setFormCategories(formCategories.map((c, i) => {
      if (i !== catIdx) return c
      return {
        ...c,
        criteria: c.criteria.map((cr, j) => {
          if (j !== crIdx) return cr
          const updated = { ...cr, [field]: value }
          if (field === 'label') {
            updated.key = value.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
          }
          return updated
        }),
      }
    }))
  }

  const handleRatingPresetChange = (preset: string) => {
    setRatingPreset(preset)
    if (preset !== 'custom' && RATING_SCALE_PRESETS[preset]) {
      setFormRatingScale(RATING_SCALE_PRESETS[preset])
    }
  }

  const updateRatingLevel = (idx: number, field: keyof ApiRatingScaleLevel, value: string | number) => {
    setFormRatingScale(formRatingScale.map((l, i) => i === idx ? { ...l, [field]: value } : l))
    setRatingPreset('custom')
  }

  const addRatingLevel = () => {
    const maxVal = Math.max(...formRatingScale.map(l => l.value), 0)
    setFormRatingScale([...formRatingScale, { value: maxVal + 1, label: '', description: '' }])
    setRatingPreset('custom')
  }

  const removeRatingLevel = (idx: number) => {
    if (formRatingScale.length <= 2) return
    setFormRatingScale(formRatingScale.filter((_, i) => i !== idx))
    setRatingPreset('custom')
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
      criteria: c.criteria.length > 0
        ? c.criteria.filter(cr => cr.label).map(cr => ({
            key: cr.key,
            label: cr.label,
            description: cr.description || undefined,
          }))
        : undefined,
    }))

    const ratingScale = formRatingScale.length >= 2 ? formRatingScale : undefined

    if (editing) {
      updateMutation.mutate(
        { id: editing.id, data: { name: formName, categories: cats, rating_scale: ratingScale } },
        {
          onSuccess: () => { toast.success('Template updated'); setShowForm(false) },
          onError: (err: Error) => toast.error(err.message),
        }
      )
    } else {
      createMutation.mutate(
        { university_id: formUniId, type: formType, name: formName, categories: cats, rating_scale: ratingScale },
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
          <p className="text-stone-500">Manage custom evaluation rubrics per university</p>
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
                    {t.rating_scale && (
                      <Badge variant="secondary" size="sm">{t.rating_scale.length}-point scale</Badge>
                    )}
                  </div>
                  <p className="text-sm text-stone-500 mb-3">{t.university?.name}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {t.categories.map(c => (
                      <span key={c.key} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-lg">
                        {c.label}{c.weight ? ` (${c.weight}%)` : ''}
                        {c.criteria && c.criteria.length > 0 && (
                          <span className="text-stone-400 ml-1">({c.criteria.length} criteria)</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openDuplicate(t)} className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors" title="Duplicate">
                    <Copy className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(t)} className="p-2 rounded-lg hover:bg-stone-100 text-stone-500 transition-colors" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-500 hover:text-red-600 transition-colors" title="Delete">
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
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
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

          {/* Rating Scale */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-stone-700">Rating Scale</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-500">Preset:</span>
                {['3', '4', '5', '10'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handleRatingPresetChange(p)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      ratingPreset === p ? 'bg-primary-50 border-primary-300 text-primary-700' : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {p}-pt
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              {formRatingScale.map((level, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-stone-50 rounded-lg px-3 py-2">
                  <input
                    type="number"
                    value={level.value}
                    onChange={e => updateRatingLevel(idx, 'value', Number(e.target.value))}
                    className="w-14 rounded-lg border border-stone-200 px-2 py-1.5 text-sm text-center focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                    min="0"
                  />
                  <input
                    value={level.label}
                    onChange={e => updateRatingLevel(idx, 'label', e.target.value)}
                    placeholder="Label *"
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  />
                  <input
                    value={level.description || ''}
                    onChange={e => updateRatingLevel(idx, 'description', e.target.value)}
                    placeholder="Description (optional)"
                    className="flex-1 rounded-lg border border-stone-200 px-3 py-1.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                  />
                  {formRatingScale.length > 2 && (
                    <button onClick={() => removeRatingLevel(idx)} className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addRatingLevel}
                className="text-xs text-primary-600 hover:text-primary-700 font-medium pl-1"
              >
                + Add level
              </button>
            </div>
          </div>

          {/* Categories with Criteria */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-stone-700">Rating Categories *</label>
              <Button size="sm" variant="outline" onClick={addCategory}><Plus className="w-3 h-3" /> Add</Button>
            </div>
            <div className="space-y-2">
              {formCategories.map((cat, idx) => (
                <div key={idx} className="bg-stone-50 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-stone-400 mt-2.5 shrink-0" />
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {PRESET_CATEGORIES.includes(cat.label) || cat.label === '' ? (
                        <select
                          value={cat.label}
                          onChange={e => {
                            if (e.target.value === '__other__') {
                              updateCategory(idx, 'label', '')
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

                  {/* Criteria sub-items */}
                  <div className="ml-6 mt-2">
                    <button
                      type="button"
                      onClick={() => toggleCategoryExpand(idx)}
                      className="flex items-center gap-1 text-xs text-stone-500 hover:text-stone-700 font-medium mb-1"
                    >
                      {cat.expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                      Criteria ({cat.criteria.length})
                    </button>
                    {cat.expanded && (
                      <div className="space-y-1.5 pl-1">
                        {cat.criteria.map((cr, crIdx) => (
                          <div key={crIdx} className="flex items-center gap-2">
                            <span className="text-xs text-stone-400 w-4 text-right">{crIdx + 1}.</span>
                            <input
                              value={cr.label}
                              onChange={e => updateCriterion(idx, crIdx, 'label', e.target.value)}
                              placeholder="Criterion name"
                              className="flex-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                            />
                            <input
                              value={cr.description}
                              onChange={e => updateCriterion(idx, crIdx, 'description', e.target.value)}
                              placeholder="Description (optional)"
                              className="flex-1 rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                            />
                            <button onClick={() => removeCriterion(idx, crIdx)} className="p-1 rounded hover:bg-red-50 text-stone-400 hover:text-red-500">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addCriterion(idx)}
                          className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                        >
                          + Add criterion
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setShowPreview(true)}>
              <Eye className="w-4 h-4" /> Preview Rubric
            </Button>
            <div className="flex gap-2">
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
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal isOpen={showPreview} onClose={() => setShowPreview(false)} title="Rubric Preview" size="xl">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-stone-50">
                <th className="text-left px-3 py-2 border border-stone-200 font-medium text-stone-700">Category</th>
                {formRatingScale.map(level => (
                  <th key={level.value} className="text-center px-3 py-2 border border-stone-200 font-medium text-stone-700 min-w-[100px]">
                    <div>{level.label}</div>
                    <div className="text-xs font-normal text-stone-400">({level.value})</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {formCategories.filter(c => c.label).map((cat) => (
                <>
                  <tr key={cat.key}>
                    <td className="px-3 py-2 border border-stone-200 font-medium text-stone-900">
                      {cat.label}
                      {cat.weight && <span className="text-xs text-stone-400 ml-1">({cat.weight}%)</span>}
                      {cat.description && <p className="text-xs text-stone-500 font-normal mt-0.5">{cat.description}</p>}
                    </td>
                    {formRatingScale.map(level => (
                      <td key={level.value} className="text-center px-3 py-2 border border-stone-200">
                        <div className="w-4 h-4 rounded-full border-2 border-stone-300 mx-auto" />
                      </td>
                    ))}
                  </tr>
                  {cat.criteria.filter(cr => cr.label).map(cr => (
                    <tr key={`${cat.key}-${cr.key}`} className="bg-stone-50/50">
                      <td className="px-3 py-1.5 border border-stone-200 pl-8 text-stone-600 text-xs">
                        {cr.label}
                        {cr.description && <span className="text-stone-400 ml-1">- {cr.description}</span>}
                      </td>
                      {formRatingScale.map(level => (
                        <td key={level.value} className="text-center px-3 py-1.5 border border-stone-200">
                          <div className="w-3 h-3 rounded-full border border-stone-300 mx-auto" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ))}
            </tbody>
          </table>
          {formRatingScale.some(l => l.description) && (
            <div className="mt-3 text-xs text-stone-500">
              <strong>Scale descriptions: </strong>
              {formRatingScale.filter(l => l.description).map(l => `${l.value} = ${l.description}`).join(' | ')}
            </div>
          )}
        </div>
        <div className="flex justify-end mt-4">
          <Button variant="secondary" onClick={() => setShowPreview(false)}>Close</Button>
        </div>
      </Modal>
    </div>
  )
}
