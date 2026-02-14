import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius, colors } from '../../theme'
import { Screen, Button, Input } from '../../components/ui'
import { authApi } from '../../api/api'

export function ForgotPasswordScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async () => {
    setError('')
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    setIsLoading(true)
    try {
      await authApi.forgotPassword(email.trim())
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (sent) {
    return (
      <Screen>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.successLight }]}>
              <Ionicons name="checkmark-circle" size={40} color={theme.colors.success} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Check Your Email</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              We've sent a password reset link to {email}. Please check your inbox and follow the instructions.
            </Text>
          </View>

          <Button onPress={() => navigation.navigate('Login')} fullWidth size="lg">
            Back to Sign In
          </Button>

          <TouchableOpacity onPress={() => { setSent(false); setEmail('') }} style={styles.retryBtn}>
            <Text style={[styles.retryText, { color: theme.colors.textSecondary }]}>
              Didn't receive the email? Try again
            </Text>
          </TouchableOpacity>
        </View>
      </Screen>
    )
  }

  return (
    <Screen safeArea={false} scroll={true}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Back + Header */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary[100] }]}>
              <Ionicons name="mail-open" size={36} color={colors.primary[600]} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>Reset Password</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Enter your email address and we'll send you a link to reset your password.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {error ? (
              <View style={[styles.errorBanner, { backgroundColor: theme.colors.dangerLight }]}>
                <Ionicons name="alert-circle" size={18} color={theme.colors.danger} />
                <Text style={[styles.errorText, { color: theme.colors.danger }]}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Email Address"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              autoFocus
              icon={<Ionicons name="mail-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <Button onPress={handleSubmit} loading={isLoading} fullWidth size="lg">
              Send Reset Link
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Remember your password?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  backBtn: {
    marginBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
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
    paddingHorizontal: spacing.md,
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
  linkText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footerText: {
    fontSize: fontSize.sm,
  },
  retryBtn: {
    alignItems: 'center',
    marginTop: spacing.md,
  },
  retryText: {
    fontSize: fontSize.sm,
  },
})
