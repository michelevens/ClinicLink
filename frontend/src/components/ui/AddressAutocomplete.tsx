import { useState, useRef, useEffect, useCallback } from 'react'
import { MapPin } from 'lucide-react'
import { loadGoogleMaps } from '../../lib/google-maps'

export interface AddressFields {
  address: string
  city: string
  state: string
  zip: string
}

interface AddressAutocompleteProps {
  value: AddressFields
  onChange: (fields: AddressFields) => void
  disabled?: boolean
  required?: boolean
  /** Labels for each field */
  labels?: { address?: string; city?: string; state?: string; zip?: string }
}

// Parse Google Places address components into our fields
function parseAddressComponents(components: google.maps.places.PlaceResult['address_components']): Partial<AddressFields> {
  if (!components) return {}

  const get = (type: string) => components.find(c => c.types.includes(type))

  const streetNumber = get('street_number')?.long_name ?? ''
  const route = get('route')?.long_name ?? ''

  return {
    address: `${streetNumber} ${route}`.trim(),
    city: get('locality')?.long_name ?? get('sublocality_level_1')?.long_name ?? '',
    state: get('administrative_area_level_1')?.short_name ?? '',
    zip: get('postal_code')?.long_name ?? '',
  }
}

export function AddressAutocomplete({ value, onChange, disabled, required, labels }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [apiAvailable, setApiAvailable] = useState(false)

  const handleFieldChange = useCallback((field: keyof AddressFields, val: string) => {
    onChange({ ...value, [field]: val })
  }, [value, onChange])

  // Load Google Maps and initialize autocomplete
  useEffect(() => {
    let cancelled = false

    loadGoogleMaps().then(() => {
      if (cancelled || !inputRef.current) return
      if (typeof google === 'undefined' || !google.maps?.places) return

      setApiAvailable(true)

      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address'],
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        if (!place.address_components) return

        const parsed = parseAddressComponents(place.address_components)
        onChange({
          address: parsed.address || value.address,
          city: parsed.city || value.city,
          state: parsed.state || value.state,
          zip: parsed.zip || value.zip,
        })
      })

      autocompleteRef.current = autocomplete
    }).catch(() => {
      // Google Maps failed to load — inputs still work as plain text
    })

    return () => {
      cancelled = true
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const inputClass = 'w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-colors disabled:opacity-50'
  const labelClass = 'block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1'

  return (
    <div className="space-y-3">
      {/* Address field with autocomplete */}
      <div>
        <label className={labelClass}>{labels?.address ?? 'Address'}{required && ' *'}</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={value.address}
            onChange={e => handleFieldChange('address', e.target.value)}
            placeholder={apiAvailable ? 'Start typing an address...' : 'Street address'}
            className={`${inputClass} pl-9`}
            disabled={disabled}
            required={required}
            autoComplete="off"
          />
        </div>
      </div>

      {/* City / State / ZIP in a row */}
      <div className="grid grid-cols-6 gap-3">
        <div className="col-span-3">
          <label className={labelClass}>{labels?.city ?? 'City'}{required && ' *'}</label>
          <input
            type="text"
            value={value.city}
            onChange={e => handleFieldChange('city', e.target.value)}
            placeholder="City"
            className={inputClass}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="col-span-1">
          <label className={labelClass}>{labels?.state ?? 'State'}{required && ' *'}</label>
          <input
            type="text"
            value={value.state}
            onChange={e => handleFieldChange('state', e.target.value.toUpperCase().slice(0, 2))}
            placeholder="FL"
            maxLength={2}
            className={inputClass}
            disabled={disabled}
            required={required}
          />
        </div>
        <div className="col-span-2">
          <label className={labelClass}>{labels?.zip ?? 'ZIP'}{required && ' *'}</label>
          <input
            type="text"
            value={value.zip}
            onChange={e => handleFieldChange('zip', e.target.value)}
            placeholder="33101"
            className={inputClass}
            disabled={disabled}
            required={required}
          />
        </div>
      </div>
    </div>
  )
}
