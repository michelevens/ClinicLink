import { type ReactNode } from 'react'
import { View, ScrollView, StyleSheet, RefreshControl, type ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../theme'

interface ScreenProps {
  children: ReactNode
  scroll?: boolean
  padded?: boolean
  safeArea?: boolean
  refreshing?: boolean
  onRefresh?: () => void
  style?: ViewStyle
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  safeArea = true,
  refreshing,
  onRefresh,
  style,
}: ScreenProps) {
  const { theme } = useTheme()

  const content = (
    <View style={[styles.container, { backgroundColor: theme.colors.background }, style]}>
      {scroll ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, padded && styles.padded]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            onRefresh ? (
              <RefreshControl
                refreshing={refreshing ?? false}
                onRefresh={onRefresh}
                tintColor={theme.colors.primary}
                colors={[theme.colors.primary]}
              />
            ) : undefined
          }
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.fill, padded && styles.padded]}>{children}</View>
      )}
    </View>
  )

  if (safeArea) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]} edges={['top']}>
        {content}
      </SafeAreaView>
    )
  }

  return content
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 32 },
  fill: { flex: 1 },
  padded: { paddingHorizontal: 16 },
})
