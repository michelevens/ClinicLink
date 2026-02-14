import { useState, useEffect, type ReactNode } from 'react'
import { useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ThemeContext, lightTheme, darkTheme } from './index'

const THEME_KEY = 'cliniclink_theme_preference'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme()
  const [preference, setPreference] = useState<'system' | 'light' | 'dark'>('system')

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setPreference(saved)
      }
    })
  }, [])

  const handleSetPreference = (pref: 'system' | 'light' | 'dark') => {
    setPreference(pref)
    AsyncStorage.setItem(THEME_KEY, pref)
  }

  const isDark =
    preference === 'dark' || (preference === 'system' && systemScheme === 'dark')

  const theme = isDark ? darkTheme : lightTheme

  return (
    <ThemeContext.Provider
      value={{ theme, preference, setPreference: handleSetPreference }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
