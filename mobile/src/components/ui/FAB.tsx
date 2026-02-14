import { type ReactNode } from 'react'
import { TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../theme'
import { shadows } from '../../theme'

interface FABProps {
  icon: ReactNode
  onPress: () => void
  color?: string
}

export function FAB({ icon, onPress, color }: FABProps) {
  const { theme } = useTheme()

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.fab,
        shadows.glowPrimary,
        { backgroundColor: color ?? theme.colors.primary },
      ]}
    >
      {icon}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
})
