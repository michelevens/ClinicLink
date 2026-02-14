import { type ReactNode } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '../../theme'
import { Card } from './Card'
import { spacing, fontSize, fontWeight } from '../../theme'

interface StatCardProps {
  label: string
  value: string | number
  icon?: ReactNode
  color?: string
  trend?: { value: string; positive: boolean }
}

export function StatCard({ label, value, icon, color, trend }: StatCardProps) {
  const { theme } = useTheme()

  return (
    <Card padding="md" style={styles.card}>
      <View style={styles.header}>
        {icon && (
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: color ? `${color}20` : theme.colors.primaryLight },
            ]}
          >
            {icon}
          </View>
        )}
        {trend && (
          <Text
            style={[
              styles.trend,
              { color: trend.positive ? theme.colors.success : theme.colors.danger },
            ]}
          >
            {trend.positive ? '+' : ''}{trend.value}
          </Text>
        )}
      </View>
      <Text style={[styles.value, { color: theme.colors.text }]}>
        {value}
      </Text>
      <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: 2,
  },
  label: {
    fontSize: fontSize.sm,
  },
  trend: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
  },
})
