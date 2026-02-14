import { useColorScheme } from 'react-native'
import { createContext, useContext } from 'react'
import { colors } from './colors'

export { colors }

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
} as const

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
} as const

export const fontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
}

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  glowPrimary: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
  glowSecondary: {
    shadowColor: colors.secondary[500],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 4,
  },
} as const

export interface Theme {
  dark: boolean
  colors: {
    background: string
    surface: string
    surfaceSecondary: string
    card: string
    text: string
    textSecondary: string
    textTertiary: string
    border: string
    borderLight: string
    primary: string
    primaryLight: string
    secondary: string
    accent: string
    success: string
    successLight: string
    warning: string
    warningLight: string
    danger: string
    dangerLight: string
    info: string
    infoLight: string
    tabBar: string
    tabBarBorder: string
    inputBackground: string
    overlay: string
  }
}

export const lightTheme: Theme = {
  dark: false,
  colors: {
    background: colors.stone[50],
    surface: colors.white,
    surfaceSecondary: colors.stone[100],
    card: colors.white,
    text: colors.stone[900],
    textSecondary: colors.stone[600],
    textTertiary: colors.stone[400],
    border: colors.stone[200],
    borderLight: colors.stone[100],
    primary: colors.primary[600],
    primaryLight: colors.primary[50],
    secondary: colors.secondary[500],
    accent: colors.accent[500],
    success: colors.success,
    successLight: colors.successLight,
    warning: colors.warning,
    warningLight: colors.warningLight,
    danger: colors.danger,
    dangerLight: colors.dangerLight,
    info: colors.info,
    infoLight: colors.infoLight,
    tabBar: colors.white,
    tabBarBorder: colors.stone[200],
    inputBackground: colors.stone[50],
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
}

export const darkTheme: Theme = {
  dark: true,
  colors: {
    background: colors.stone[900],
    surface: colors.stone[800],
    surfaceSecondary: colors.stone[700],
    card: colors.stone[800],
    text: colors.stone[50],
    textSecondary: colors.stone[400],
    textTertiary: colors.stone[500],
    border: colors.stone[700],
    borderLight: colors.stone[800],
    primary: colors.primary[400],
    primaryLight: 'rgba(139, 92, 246, 0.15)',
    secondary: colors.secondary[400],
    accent: colors.accent[400],
    success: '#4ade80',
    successLight: 'rgba(34, 197, 94, 0.15)',
    warning: '#fbbf24',
    warningLight: 'rgba(245, 158, 11, 0.15)',
    danger: '#f87171',
    dangerLight: 'rgba(239, 68, 68, 0.15)',
    info: '#60a5fa',
    infoLight: 'rgba(59, 130, 246, 0.15)',
    tabBar: colors.stone[800],
    tabBarBorder: colors.stone[700],
    inputBackground: colors.stone[700],
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
}

type ThemePreference = 'system' | 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  preference: ThemePreference
  setPreference: (pref: ThemePreference) => void
}

export const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  preference: 'system',
  setPreference: () => {},
})

export function useTheme() {
  return useContext(ThemeContext)
}
