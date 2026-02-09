import { Card } from '../components/ui/Card.tsx'
import { Badge } from '../components/ui/Badge.tsx'
import { Button } from '../components/ui/Button.tsx'
import { useApplications, useWithdrawApplication } from '../hooks/useApi.ts'
import { toast } from 'sonner'
import { FileText, MapPin, Calendar, Building2, Loader2, X } from 'lucide-react'

export function Applications() {
  const { data, isLoading } = useApplications()
  const withdrawMutation = useWithdrawApplication()

  const applications = data?.applications || []
  const statusOrder: Record<string, number> = { pending: 0, waitlisted: 1, accepted: 2, declined: 3, withdrawn: 4 }
  const sorted = [...applications].sort((a, b) => (statusOrder[a.status] || 5) - (statusOrder[b.status] || 5))

  const handleWithdraw = async (id: string) => {
    try {
      await withdrawMutation.mutateAsync(id)
      toast.success('Application withdrawn')
    } catch {
      toast.error('Failed to withdraw application')
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
          <h1 className="text-2xl font-bold text-stone-900">My Applications</h1>
          <p className="text-stone-500">{sorted.length} application{sorted.length !== 1 ? 's' : ''} submitted</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pending', count: sorted.filter(a => a.status === 'pending').length, color: 'amber' },
          { label: 'Accepted', count: sorted.filter(a => a.status === 'accepted').length, color: 'green' },
          { label: 'Waitlisted', count: sorted.filter(a => a.status === 'waitlisted').length, color: 'primary' },
        ].map(s => (
          <Card key={s.label}>
            <p className={`text-2xl font-bold text-${s.color}-600`}>{s.count}</p>
            <p className="text-sm text-stone-500">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {sorted.length === 0 && (
          <Card className="text-center py-12">
            <FileText className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-stone-700 mb-2">No applications yet</h3>
            <p className="text-stone-500">Search for rotations and submit your first application</p>
          </Card>
        )}

        {sorted.map(app => (
          <Card key={app.id}>
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-start gap-3 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900">{app.slot?.title || 'Rotation'}</h3>
                  <p className="text-sm text-stone-500 mb-2">{app.slot?.site?.name}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-stone-500">
                    {app.slot?.site && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.slot.site.city}, {app.slot.site.state}</span>}
                    {app.slot && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(app.slot.start_date).toLocaleDateString()} - {new Date(app.slot.end_date).toLocaleDateString()}</span>}
                    <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" />Applied {new Date(app.submitted_at).toLocaleDateString()}</span>
                  </div>
                  {app.notes && (
                    <p className="text-xs text-stone-500 mt-2 italic">Note: {app.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    app.status === 'accepted' ? 'success' :
                    app.status === 'pending' ? 'warning' :
                    app.status === 'waitlisted' ? 'primary' :
                    app.status === 'declined' ? 'danger' : 'default'
                  }
                  size="md"
                >
                  {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </Badge>
                {app.status === 'pending' && (
                  <Button size="sm" variant="ghost" onClick={() => handleWithdraw(app.id)} title="Withdraw">
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
