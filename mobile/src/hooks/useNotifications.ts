import { useEffect, useRef, useState } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import type { EventSubscription } from 'expo-modules-core'
import Constants from 'expo-constants'
import { api } from '../api/client'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
})

async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') return null

  const { status: existing } = await Notifications.getPermissionsAsync()
  let finalStatus = existing

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync()
    finalStatus = status
  }

  if (finalStatus !== 'granted') return null

  const projectId = Constants.expoConfig?.extra?.eas?.projectId
  const tokenData = await Notifications.getExpoPushTokenAsync({
    projectId: projectId ?? undefined,
  })

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7c3aed',
    })
  }

  return tokenData.data
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const notificationListener = useRef<EventSubscription | null>(null)
  const responseListener = useRef<EventSubscription | null>(null)

  useEffect(() => {
    registerForPushNotifications().then((token) => {
      if (token) {
        setExpoPushToken(token)
        api.post('/auth/push-token', { token, platform: Platform.OS }).catch(() => {})
      }
    })

    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Foreground notification — handled by setNotificationHandler above
    })

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data
      if (data?.type) {
        // Navigation based on notification type can be wired here
      }
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [])

  return { expoPushToken }
}
