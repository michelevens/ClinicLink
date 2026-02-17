import { useEffect } from 'react'

const SUFFIX = ' | ClinicLink'

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = title + SUFFIX
    return () => { document.title = 'ClinicLink - Clinical Rotation Matching Platform' }
  }, [title])
}
