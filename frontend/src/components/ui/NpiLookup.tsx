import { useState } from 'react'
import { npiApi, type NpiResult } from '../../services/api.ts'
import { ShieldCheck, Loader2, AlertCircle, MapPin, Stethoscope } from 'lucide-react'

interface NpiLookupProps {
  entityType: 'individual' | 'organization'
  onVerified: (result: NpiResult, npiNumber: string) => void
  onClear?: () => void
  initialNpi?: string
  label?: string
}

export function NpiLookup({ entityType, onVerified, onClear, initialNpi = '', label }: NpiLookupProps) {
  const [npiNumber, setNpiNumber] = useState(initialNpi)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<NpiResult | null>(null)
  const [error, setError] = useState('')

  const handleLookup = async () => {
    if (npiNumber.length !== 10 || !/^\d{10}$/.test(npiNumber)) {
      setError('NPI must be exactly 10 digits')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const data = await npiApi.lookup(npiNumber)
      if (data.result) {
        setResult(data.result)
        onVerified(data.result, npiNumber)
      } else {
        setError('NPI not found in the NPPES registry')
      }
    } catch {
      setError('Failed to look up NPI. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setNpiNumber('')
    setResult(null)
    setError('')
    onClear?.()
  }

  const handleChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    setNpiNumber(digits)
    if (result) {
      setResult(null)
      onClear?.()
    }
    setError('')
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-stone-700">
        {label || (entityType === 'individual' ? 'NPI Number (optional)' : 'Facility NPI (optional)')}
      </label>
      <p className="text-xs text-stone-400">
        {entityType === 'individual'
          ? 'If you have a National Provider Identifier, enter it to verify your profile. Not all clinicians have one.'
          : 'If your facility has an organizational NPI, enter it to verify. Many clinics don\'t have one.'}
      </p>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            inputMode="numeric"
            placeholder="1234567890"
            value={npiNumber}
            onChange={e => handleChange(e.target.value)}
            maxLength={10}
            className={`w-full rounded-2xl border px-4 py-3 text-sm bg-white/80 backdrop-blur-sm focus:outline-none transition-all duration-200 ${
              result
                ? 'border-emerald-300 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20'
                : error
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/20'
                : 'border-stone-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20'
            }`}
          />
          {result && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
          )}
        </div>
        {result ? (
          <button
            type="button"
            onClick={handleClear}
            className="px-4 py-2.5 rounded-2xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-all duration-200"
          >
            Clear
          </button>
        ) : (
          <button
            type="button"
            onClick={handleLookup}
            disabled={loading || npiNumber.length !== 10}
            className="px-4 py-2.5 rounded-2xl text-sm font-medium bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            Verify
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-500 text-xs">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200/50 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-700">NPI Verified</span>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-stone-900">{result.name}</p>
            {result.credential && (
              <p className="text-xs text-stone-500">{result.credential}</p>
            )}
            {result.taxonomy && (
              <p className="text-xs text-stone-600 flex items-center gap-1">
                <Stethoscope className="w-3 h-3" /> {result.taxonomy}
              </p>
            )}
            {result.address?.city && (
              <p className="text-xs text-stone-500 flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {[result.address.line1, result.address.city, result.address.state, result.address.zip].filter(Boolean).join(', ')}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
