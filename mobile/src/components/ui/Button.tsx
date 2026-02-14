import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native'
import { useTheme } from '../../theme'
import { colors, radius, spacing, fontSize, fontWeight } from '../../theme'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps {
  children: string
  onPress: () => void
  variant?: Variant
  size?: Size
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  icon?: React.ReactNode
  style?: ViewStyle
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  style,
}: ButtonProps) {
  const { theme } = useTheme()

  const variantStyles: Record<Variant, { bg: string; text: string; border?: string }> = {
    primary: { bg: theme.colors.primary, text: colors.white },
    secondary: { bg: theme.colors.secondary, text: colors.white },
    outline: { bg: 'transparent', text: theme.colors.primary, border: theme.colors.border },
    ghost: { bg: 'transparent', text: theme.colors.textSecondary },
    danger: { bg: theme.colors.danger, text: colors.white },
  }

  const sizeStyles: Record<Size, { h: number; px: number; fs: number }> = {
    sm: { h: 36, px: 12, fs: fontSize.sm },
    md: { h: 44, px: 16, fs: fontSize.base },
    lg: { h: 52, px: 20, fs: fontSize.md },
  }

  const v = variantStyles[variant]
  const s = sizeStyles[size]
  const isDisabled = disabled || loading

  const buttonStyle: ViewStyle = {
    backgroundColor: v.bg,
    height: s.h,
    paddingHorizontal: s.px,
    borderRadius: radius.md,
    borderWidth: v.border ? 1 : 0,
    borderColor: v.border,
    opacity: isDisabled ? 0.5 : 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    ...(fullWidth ? { width: '100%' as unknown as number } : {}),
  }

  const textStyle: TextStyle = {
    color: v.text,
    fontSize: s.fs,
    fontWeight: fontWeight.semibold,
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
      style={[buttonStyle, style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={v.text} />
      ) : (
        <>
          {icon}
          <Text style={textStyle}>{children}</Text>
        </>
      )}
    </TouchableOpacity>
  )
}
