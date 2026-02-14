import { useState, type ReactNode } from 'react'
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native'
import { useTheme } from '../../theme'
import { radius, spacing, fontSize, fontWeight } from '../../theme'

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string
  error?: string
  icon?: ReactNode
  rightIcon?: ReactNode
  style?: ViewStyle
}

export function Input({
  label,
  error,
  icon,
  rightIcon,
  style,
  ...props
}: InputProps) {
  const { theme } = useTheme()
  const [focused, setFocused] = useState(false)

  const borderColor = error
    ? theme.colors.danger
    : focused
    ? theme.colors.primary
    : theme.colors.border

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: theme.colors.inputBackground,
            borderColor,
            borderWidth: focused ? 2 : 1,
          },
        ]}
      >
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              paddingLeft: icon ? 0 : spacing.md,
            },
          ]}
          placeholderTextColor={theme.colors.textTertiary}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.colors.danger }]}>
          {error}
        </Text>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  label: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    minHeight: 48,
  },
  iconLeft: {
    paddingLeft: spacing.md,
    paddingRight: spacing.sm,
  },
  iconRight: {
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: fontSize.base,
    paddingRight: spacing.md,
    paddingVertical: spacing.sm,
  },
  error: {
    fontSize: fontSize.xs,
    marginLeft: 2,
  },
})
