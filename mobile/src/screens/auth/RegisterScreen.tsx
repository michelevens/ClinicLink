import { useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius, colors } from '../../theme'
import { Screen, Button, Input } from '../../components/ui'
import type { UserRole } from '../../types'

const ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: 'student', label: 'Student', icon: 'school-outline' },
  { value: 'preceptor', label: 'Preceptor', icon: 'medkit-outline' },
  { value: 'site_manager', label: 'Site Manager', icon: 'business-outline' },
  { value: 'coordinator', label: 'Coordinator', icon: 'clipboard-outline' },
  { value: 'professor', label: 'Professor', icon: 'book-outline' },
]

export function RegisterScreen({ navigation }: { navigation: any }) {
  const { register, isLoading } = useAuth()
  const { theme } = useTheme()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleRegister = async () => {
    setError('')
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter your full name.')
      return
    }
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    try {
      await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
      })
      navigation.navigate('Login')
    } catch (err: any) {
      const msg = err.errors
        ? Object.values(err.errors).flat().join('\n')
        : err.message || 'Registration failed.'
      setError(msg)
    }
  }

  return (
    <Screen safeArea={false} scroll={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Join the clinical rotation marketplace
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

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label="First Name"
                  placeholder="First"
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  autoComplete="given-name"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label="Last Name"
                  placeholder="Last"
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                  autoComplete="family-name"
                />
              </View>
            </View>

            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              icon={<Ionicons name="mail-outline" size={20} color={theme.colors.textTertiary} />}
            />

            <Input
              label="Password"
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoComplete="new-password"
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

            <Input
              label="Confirm Password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showPassword}
              icon={<Ionicons name="lock-closed-outline" size={20} color={theme.colors.textTertiary} />}
            />

            {/* Role Selector */}
            <View style={styles.roleSection}>
              <Text style={[styles.roleLabel, { color: theme.colors.text }]}>I am a...</Text>
              <View style={styles.roleGrid}>
                {ROLES.map((r) => {
                  const selected = role === r.value
                  return (
                    <TouchableOpacity
                      key={r.value}
                      style={[
                        styles.roleChip,
                        {
                          backgroundColor: selected ? theme.colors.primaryLight : theme.colors.surfaceSecondary,
                          borderColor: selected ? theme.colors.primary : theme.colors.border,
                          borderWidth: 1.5,
                        },
                      ]}
                      onPress={() => setRole(r.value)}
                    >
                      <Ionicons
                        name={r.icon as any}
                        size={18}
                        color={selected ? theme.colors.primary : theme.colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.roleChipText,
                          { color: selected ? theme.colors.primary : theme.colors.textSecondary },
                        ]}
                      >
                        {r.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            <Button onPress={handleRegister} loading={isLoading} fullWidth size="lg">
              Create Account
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.linkText, { color: theme.colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing['3xl'],
  },
  header: {
    marginBottom: spacing.xl,
  },
  backBtn: {
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfInput: {
    flex: 1,
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
  roleSection: {
    gap: spacing.sm,
  },
  roleLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  roleChipText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
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
