import { View, Text, Image, StyleSheet } from 'react-native'
import { useTheme } from '../../theme'
import { colors, fontWeight } from '../../theme'

type Size = 'sm' | 'md' | 'lg' | 'xl'

interface AvatarProps {
  name: string
  imageUrl?: string | null
  size?: Size
}

const sizeMap: Record<Size, { dim: number; fs: number }> = {
  sm: { dim: 32, fs: 12 },
  md: { dim: 40, fs: 14 },
  lg: { dim: 56, fs: 20 },
  xl: { dim: 72, fs: 26 },
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

function getColor(name: string): string {
  const palette = [
    colors.primary[500],
    colors.secondary[500],
    colors.accent[500],
    colors.primary[700],
    colors.secondary[700],
    '#06b6d4',
    '#14b8a6',
    '#8b5cf6',
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return palette[Math.abs(hash) % palette.length]
}

export function Avatar({ name, imageUrl, size = 'md' }: AvatarProps) {
  const { theme } = useTheme()
  const s = sizeMap[size]

  if (imageUrl) {
    return (
      <Image
        source={{ uri: imageUrl }}
        style={[styles.image, { width: s.dim, height: s.dim, borderRadius: s.dim / 2 }]}
      />
    )
  }

  const bg = getColor(name)

  return (
    <View
      style={[
        styles.fallback,
        { width: s.dim, height: s.dim, borderRadius: s.dim / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.initials, { fontSize: s.fs }]}>{getInitials(name)}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  image: { backgroundColor: '#e7e5e4' },
  fallback: { alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#fff', fontWeight: fontWeight.semibold },
})
