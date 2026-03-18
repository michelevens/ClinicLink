import { StatusBar } from 'expo-status-bar'
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from './src/theme/ThemeProvider'
import { AuthProvider } from './src/contexts/AuthContext'
import { useTheme } from './src/theme'
import { useNotifications } from './src/hooks/useNotifications'
import { RootNavigator } from './src/navigation/RootNavigator'
import { ErrorBoundary } from './src/components/ErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 2,
    },
  },
})

function AppInner() {
  const { theme } = useTheme()
  useNotifications()

  const navigationTheme = {
    ...(theme.dark ? DarkTheme : DefaultTheme),
    colors: {
      ...(theme.dark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <RootNavigator />
      <StatusBar style={theme.dark ? 'light' : 'dark'} />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AppInner />
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
