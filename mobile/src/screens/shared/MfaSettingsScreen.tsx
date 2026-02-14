import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight, radius } from '../../theme'
import { Card, Badge, Button, Input } from '../../components/ui'
import { useMfaStatus, useMfaSetup, useMfaConfirm, useMfaDisable, useMfaBackupCodes } from '../../hooks/useApi'

export function MfaSettingsScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { data: statusData, isLoading } = useMfaStatus()
  const mfaSetup = useMfaSetup()
  const mfaConfirm = useMfaConfirm()
  const mfaDisable = useMfaDisable()
  const mfaBackupCodes = useMfaBackupCodes()

  const mfaEnabled = statusData?.mfa_enabled ?? false
  const [setupSecret, setSetupSecret] = useState('')
  const [confirmCode, setConfirmCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showSetup, setShowSetup] = useState(false)
  const [showDisable, setShowDisable] = useState(false)

  const handleSetup = () => {
    mfaSetup.mutate(undefined, {
      onSuccess: (data: any) => {
        setSetupSecret(data?.data?.secret ?? data?.secret ?? '')
        setShowSetup(true)
      },
      onError: () => Alert.alert('Error', 'Failed to start MFA setup'),
    })
  }

  const handleConfirm = () => {
    if (!confirmCode.trim()) {
      Alert.alert('Error', 'Enter the 6-digit code from your authenticator app')
      return
    }
    mfaConfirm.mutate(confirmCode.trim(), {
      onSuccess: (data: any) => {
        setShowSetup(false)
        setConfirmCode('')
        setSetupSecret('')
        const codes = data?.data?.backup_codes ?? data?.backup_codes ?? []
        if (codes.length > 0) {
          setBackupCodes(codes)
        }
        Alert.alert('Success', 'MFA has been enabled')
      },
      onError: () => Alert.alert('Error', 'Invalid code. Please try again.'),
    })
  }

  const handleDisable = () => {
    if (!disablePassword.trim()) {
      Alert.alert('Error', 'Enter your password to disable MFA')
      return
    }
    mfaDisable.mutate(disablePassword.trim(), {
      onSuccess: () => {
        setShowDisable(false)
        setDisablePassword('')
        Alert.alert('Success', 'MFA has been disabled')
      },
      onError: () => Alert.alert('Error', 'Incorrect password'),
    })
  }

  const handleGetBackupCodes = () => {
    Alert.prompt?.(
      'Backup Codes',
      'Enter your password to view backup codes',
      (password: string) => {
        mfaBackupCodes.mutate(password, {
          onSuccess: (data: any) => {
            setBackupCodes(data?.data?.backup_codes ?? data?.backup_codes ?? [])
          },
          onError: () => Alert.alert('Error', 'Incorrect password'),
        })
      },
    ) ?? Alert.alert('Backup Codes', 'Use your authenticator app for 2FA codes.')
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Security & MFA</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        <Card style={[styles.statusCard, { backgroundColor: theme.colors.card }]}>
          <View style={styles.statusRow}>
            <Ionicons
              name={mfaEnabled ? 'shield-checkmark' : 'shield-outline'}
              size={32}
              color={mfaEnabled ? theme.colors.success : theme.colors.textTertiary}
            />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: theme.colors.text }]}>
                Two-Factor Authentication
              </Text>
              <Badge variant={mfaEnabled ? 'success' : 'warning'} size="sm">
                {mfaEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </View>
          </View>
          <Text style={[styles.statusDesc, { color: theme.colors.textSecondary }]}>
            {mfaEnabled
              ? 'Your account is protected with two-factor authentication.'
              : 'Add an extra layer of security to your account.'}
          </Text>
        </Card>

        {/* Enable MFA */}
        {!mfaEnabled && !showSetup && (
          <Button onPress={handleSetup} loading={mfaSetup.isPending} fullWidth>
            Enable MFA
          </Button>
        )}

        {/* Setup Flow */}
        {showSetup && (
          <Card style={[styles.setupCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.setupTitle, { color: theme.colors.text }]}>Set Up Authenticator</Text>
            <Text style={[styles.setupDesc, { color: theme.colors.textSecondary }]}>
              1. Install an authenticator app (Google Authenticator, Authy){'\n'}
              2. Add a new account using this secret key:{'\n'}
            </Text>
            {setupSecret && (
              <View style={[styles.secretBox, { backgroundColor: theme.colors.surfaceSecondary }]}>
                <Text style={[styles.secretText, { color: theme.colors.text }]} selectable>
                  {setupSecret}
                </Text>
              </View>
            )}
            <Text style={[styles.setupDesc, { color: theme.colors.textSecondary }]}>
              3. Enter the 6-digit code from the app:
            </Text>
            <Input
              placeholder="000000"
              value={confirmCode}
              onChangeText={setConfirmCode}
              keyboardType="number-pad"
              maxLength={6}
            />
            <View style={styles.setupActions}>
              <Button
                variant="ghost"
                onPress={() => { setShowSetup(false); setConfirmCode(''); setSetupSecret('') }}
              >
                Cancel
              </Button>
              <Button onPress={handleConfirm} loading={mfaConfirm.isPending}>
                Verify & Enable
              </Button>
            </View>
          </Card>
        )}

        {/* Disable MFA */}
        {mfaEnabled && !showDisable && (
          <View style={styles.mfaActions}>
            <Button variant="outline" onPress={handleGetBackupCodes} fullWidth>
              View Backup Codes
            </Button>
            <Button variant="danger" onPress={() => setShowDisable(true)} fullWidth>
              Disable MFA
            </Button>
          </View>
        )}

        {showDisable && (
          <Card style={[styles.setupCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.setupTitle, { color: theme.colors.danger }]}>Disable MFA</Text>
            <Text style={[styles.setupDesc, { color: theme.colors.textSecondary }]}>
              Enter your password to disable two-factor authentication.
            </Text>
            <Input
              placeholder="Your password"
              value={disablePassword}
              onChangeText={setDisablePassword}
              secureTextEntry
            />
            <View style={styles.setupActions}>
              <Button
                variant="ghost"
                onPress={() => { setShowDisable(false); setDisablePassword('') }}
              >
                Cancel
              </Button>
              <Button variant="danger" onPress={handleDisable} loading={mfaDisable.isPending}>
                Disable
              </Button>
            </View>
          </Card>
        )}

        {/* Backup Codes */}
        {backupCodes.length > 0 && (
          <Card style={[styles.codesCard, { backgroundColor: theme.colors.card }]}>
            <Text style={[styles.codesTitle, { color: theme.colors.text }]}>Backup Codes</Text>
            <Text style={[styles.codesDesc, { color: theme.colors.textSecondary }]}>
              Save these codes securely. Each code can only be used once.
            </Text>
            <View style={styles.codesGrid}>
              {backupCodes.map((code, i) => (
                <View key={i} style={[styles.codeBox, { backgroundColor: theme.colors.surfaceSecondary }]}>
                  <Text style={[styles.codeText, { color: theme.colors.text }]} selectable>
                    {code}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        )}
      </View>

      <View style={{ height: spacing['3xl'] }} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.bold,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  statusCard: {},
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  statusInfo: {
    flex: 1,
    gap: spacing.xs,
  },
  statusTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
  },
  statusDesc: {
    fontSize: fontSize.sm,
    lineHeight: 20,
  },
  setupCard: {},
  setupTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.sm,
  },
  setupDesc: {
    fontSize: fontSize.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  secretBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  secretText: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.bold,
    letterSpacing: 2,
  },
  setupActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  mfaActions: {
    gap: spacing.sm,
  },
  codesCard: {},
  codesTitle: {
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    marginBottom: spacing.xs,
  },
  codesDesc: {
    fontSize: fontSize.sm,
    marginBottom: spacing.md,
  },
  codesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  codeBox: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
  },
  codeText: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.medium,
    fontVariant: ['tabular-nums'],
  },
})
