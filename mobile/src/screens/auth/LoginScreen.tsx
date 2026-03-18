import { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Animated } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius, colors, shadows } from '../../theme'
import { Screen, Button, Input } from '../../components/ui'
import { haptic } from '../../lib/haptics'

export function LoginScreen({ navigation }: { navigation: any }) {
  const { login, isLoading, mfaPending } = useAuth()
  const { theme } = useTheme()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  // Entrance animations
  const logoScale = useRef(new Animated.Value(0.3)).current
  const logoOpacity = useRef(new Animated.Value(0)).current
  const formTranslateY = useRef(new Animated.Value(40)).current
  const formOpacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start()

    Animated.parallel([
      Animated.timing(formTranslateY, { toValue: 0, duration: 500, delay: 200, useNativeDriver: true }),
      Animated.timing(formOpacity, { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start()
  }, [])

  const handleLogin = async () => {
    setError('')
    if (!loginId.trim() || !password) {
      haptic.warning()
      setError('Please enter your email and password.')
      return
    }
    try {
      haptic.light()
      await login(loginId.trim(), password)
      haptic.success()
      if (mfaPending) {
        navigation.navigate('MfaVerify')
      }
    } catch (err: any) {
      haptic.error()
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
          {/* Logo / Brand — animated entrance */}
          <Animated.View style={[styles.brand, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <View style={[styles.logoContainer, { backgroundColor: colors.primary[100] }, shadows.glowPrimary]}>
              <Ionicons name="medical" size={40} color={colors.primary[600]} />
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>ClinicLink</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Clinical Rotation Marketplace
            </Text>
          </Animated.View>

          {/* Form — animated slide up */}
          <Animated.View style={[styles.form, { opacity: formOpacity, transform: [{ translateY: formTranslateY }] }]}>
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
                <TouchableOpacity onPress={() => { haptic.selection(); setShowPassword(!showPassword) }}>
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
          </Animated.View>

          {/* Register link */}
          <Animated.View style={[styles.footer, { opacity: formOpacity }]}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Don't have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Company */}
          <View style={styles.companyFooter}>
            <Text style={[styles.companyText, { color: theme.colors.textTertiary }]}>
              A product of Acsyom Analytics
            </Text>
            <Text style={[styles.companyText, { color: theme.colors.textTertiary }]}>
              Clermont, FL
            </Text>
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
    width: 88,
    height: 88,
    borderRadius: 24,
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
  companyFooter: {
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  companyText: {
    fontSize: fontSize.xs,
    marginTop: 2,
  },
})
