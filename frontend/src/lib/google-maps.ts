let loadPromise: Promise<void> | null = null

/**
 * Load the Google Maps JavaScript API (Places library).
 * Safe to call multiple times — only loads once.
 * No-ops if VITE_GOOGLE_MAPS_API_KEY is not set.
 */
export function loadGoogleMaps(): Promise<void> {
  if (loadPromise) return loadPromise

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    loadPromise = Promise.resolve()
    return loadPromise
  }

  // Already loaded
  if (typeof google !== 'undefined' && google.maps?.places) {
    loadPromise = Promise.resolve()
    return loadPromise
  }

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(script)
  })

  return loadPromise
}
