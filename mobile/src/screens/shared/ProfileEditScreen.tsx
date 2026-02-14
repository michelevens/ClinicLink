import { useState } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useTheme } from '../../theme'
import { spacing, fontSize, fontWeight } from '../../theme'
import { Button, Input, Avatar } from '../../components/ui'
import { useAuth } from '../../contexts/AuthContext'
import { authApi } from '../../api/api'

export function ProfileEditScreen({ navigation }: { navigation: any }) {
  const { theme } = useTheme()
  const { user } = useAuth()

  const [firstName, setFirstName] = useState(user?.firstName ?? '')
  const [lastName, setLastName] = useState(user?.lastName ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await authApi.updateProfile({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.trim() || undefined,
      })
      Alert.alert('Success', 'Profile updated', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    } catch {
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    // In a full implementation, this would show a modal or navigate to a password change form
    Alert.alert('Change Password', 'This feature requires the password change form. Coming soon.')
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Avatar */}
      <View style={styles.avatarSection}>
        <Avatar name={`${firstName} ${lastName}`} size="xl" />
        <Text style={[styles.emailText, { color: theme.colors.textSecondary }]}>
          {user?.email}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="First Name"
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
        />

        <Input
          label="Last Name"
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
        />

        <Input
          label="Phone"
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone number"
          keyboardType="phone-pad"
        />

        <Button
          onPress={handleSave}
          loading={saving}
          fullWidth
        >
          Save Changes
        </Button>

        <Button
          variant="outline"
          onPress={handleChangePassword}
          fullWidth
          icon={<Ionicons name="key-outline" size={16} color={theme.colors.primary} />}
        >
          Change Password
        </Button>
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emailText: {
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  form: {
    padding: spacing.md,
    gap: spacing.md,
  },
})
