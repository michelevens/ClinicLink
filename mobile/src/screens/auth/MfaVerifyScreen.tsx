import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius, colors } from '../../theme'
import { Screen, Button, Input } from '../../components/ui'

export function MfaVerifyScreen({ navigation }: { navigation: any }) {
  const { verifyMfa, cancelMfa, isLoading } = useAuth()
  const { theme } = useTheme()
  const [code, setCode] = useState('')
  const [error, setError] = useState('')

  const handleVerify = async () => {
    setError('')
    if (code.length < 6) {
      setError('Please enter your 6-digit code.')
      return
    }
    try {
      await verifyMfa(code)
    } catch (err: any) {
      setError(err.message || 'Invalid verification code.')
    }
  }

  const handleCancel = () => {
    cancelMfa()
    navigation.goBack()
  }

  return (
    <Screen>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primary[100] }]}>
            <Ionicons name="shield-checkmark" size={36} color={colors.primary[600]} />
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Two-Factor Authentication
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Enter the 6-digit code from your authenticator app, or use a backup code.
          </Text>
        </View>

        <View style={styles.form}>
          {error ? (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.dangerLight }]}>
              <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
              <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Verification Code"
            placeholder="000000"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={10}
            autoFocus
            icon={<Ionicons name="key-outline" size={20} color={theme.colors.textTertiary} />}
          />

          <Button onPress={handleVerify} loading={isLoading} fullWidth size="lg">
            Verify
          </Button>

          <TouchableOpacity onPress={handleCancel} style={styles.cancelBtn}>
            <Text style={[styles.cancelText, { color: theme.colors.textSecondary }]}>
              Cancel and return to login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: fontSize.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    gap: spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  errorText: {
    fontSize: fontSize.sm,
    flex: 1,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  cancelText: {
    fontSize: fontSize.sm,
  },
})
