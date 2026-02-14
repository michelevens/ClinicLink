import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../theme'
import { radius, spacing, fontSize, fontWeight } from '../../theme'

type Variant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'
type Size = 'sm' | 'md'

interface BadgeProps {
  children: string
  variant?: Variant
  size?: Size
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const { theme } = useTheme()

  const variantColors: Record<Variant, { bg: string; text: string }> = {
    default: { bg: theme.colors.surfaceSecondary, text: theme.colors.textSecondary },
    primary: { bg: theme.colors.primaryLight, text: theme.colors.primary },
    secondary: { bg: theme.dark ? 'rgba(244,63,94,0.15)' : '#fff1f2', text: theme.colors.secondary },
    success: { bg: theme.colors.successLight, text: theme.colors.success },
    warning: { bg: theme.colors.warningLight, text: theme.colors.warning },
    danger: { bg: theme.colors.dangerLight, text: theme.colors.danger },
    info: { bg: theme.colors.infoLight, text: theme.colors.info },
  }

  const v = variantColors[variant]
  const isSmall = size === 'sm'

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: v.bg,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
          paddingVertical: isSmall ? 2 : 4,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: v.text,
            fontSize: isSmall ? fontSize.xs : fontSize.sm,
          },
        ]}
      >
        {children}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontWeight: fontWeight.semibold,
  },
})
