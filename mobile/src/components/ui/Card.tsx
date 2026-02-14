import { View, StyleSheet, type StyleProp, type ViewStyle, type ViewProps } from 'react-native'
import { useTheme } from '../../theme'
import { radius, spacing, shadows } from '../../theme'

type Padding = 'none' | 'sm' | 'md' | 'lg'

interface CardProps extends ViewProps {
  padding?: Padding
  shadow?: boolean
  style?: StyleProp<ViewStyle>
}

const paddingMap: Record<Padding, number> = {
  none: 0,
  sm: spacing.sm,
  md: spacing.md,
  lg: spacing.lg,
}

export function Card({
  children,
  padding = 'md',
  shadow = true,
  style,
  ...props
}: CardProps) {
  const { theme } = useTheme()

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.borderLight,
          padding: paddingMap[padding],
        },
        shadow && shadows.md,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
})
