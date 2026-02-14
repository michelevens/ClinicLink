import { View, Text, StyleSheet } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { Screen, EmptyState } from '../../components/ui'

export function PlaceholderScreen({ route }: { route: any }) {
  const { theme } = useTheme()
  const title = route?.params?.title ?? route?.name ?? 'Coming Soon'

  return (
    <Screen>
      <EmptyState
        icon={<Ionicons name="construct-outline" size={48} color={theme.colors.textTertiary} />}
        title={title}
        message="This screen is under development and will be available soon."
      />
    </Screen>
  )
}
