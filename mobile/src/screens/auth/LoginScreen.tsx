import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius, colors } from '../../theme'
import { Screen, Button, Input } from '../../components/ui'

export function LoginScreen({ navigation }: { navigation: any }) {
  const { login, isLoading, mfaPending } = useAuth()
  const { theme } = useTheme()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    setError('')
    if (!loginId.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    try {
      await login(loginId.trim(), password)
      // If MFA is required, navigate to MFA screen
      if (mfaPending) {
        navigation.navigate('MfaVerify')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <Screen safeArea={false} scroll={true}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          {/* Logo / Brand */}
          <View style={styles.brand}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary[100] }]}>
              <Ionicons name="medical" size={40} color={colors.primary[600]} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>ClinicLink</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Clinical Rotation Marketplace
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
              label="Email or Username"
              placeholder="Enter your email or username"
              value={loginId}
              onChangeText={setLoginId}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              icon={<Ionicons name="mail-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="password"
              icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textTertiary} />}
              rightIcon={
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={theme.colors.textTertiary}
                  />
                </TouchableOpacity>
              }
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotLink}
            >
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <Button
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
            >
              Sign In
            </Button>
          </View>

          {/* Register link */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Create Account
              </Text>
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
    paddingVertical: spacing['3xl'],
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize['2xl'],
    fontWeight: fontWeight.bold,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: fontSize.base,
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
  forgotLink: {
    alignSelf: 'flex-end',
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
})
