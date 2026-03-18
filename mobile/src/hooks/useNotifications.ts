import { useEffect, useRef, useState, useCallback } from 'react'
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

// Screen mapping: notification type → mobile screen + params
function getNavigationTarget(data: Record<string, unknown>): { screen: string; params?: Record<string, unknown> } | null {
  const type = data?.type as string | undefined
  const screen = data?.screen as string | undefined

  if (screen) {
    // Backend already specifies screen name
    const params: Record<string, unknown> = {}
    if (data.conversationId) params.conversationId = data.conversationId
    if (data.applicationId) params.applicationId = data.applicationId
    if (data.hourLogId) params.hourLogId = data.hourLogId
    if (data.name) params.name = data.name
    return { screen, params: Object.keys(params).length > 0 ? params : undefined }
  }

  // Fallback mapping by type
  switch (type) {
    case 'message': return { screen: 'Conversations' }
    case 'application': return { screen: 'Applications' }
    case 'hour_log': return { screen: 'HourLog' }
    case 'evaluation': return { screen: 'Evaluations' }
    default: return null
  }
}

type NavigationCallback = (screen: string, params?: Record<string, unknown>) => void

let navigationCallback: NavigationCallback | null = null

export function setNotificationNavigator(cb: NavigationCallback) {
  navigationCallback = cb
}

export function useNotifications() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const notificationListener = useRef<EventSubscription | null>(null)
  const responseListener = useRef<EventSubscription | null>(null)

  const handleNotificationTap = useCallback((data: Record<string, unknown>) => {
    const target = getNavigationTarget(data)
    if (target && navigationCallback) {
      navigationCallback(target.screen, target.params)
    }
  }, [])

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
      const data = response.notification.request.content.data as Record<string, unknown>
      handleNotificationTap(data)
    })

    return () => {
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [handleNotificationTap])

  return { expoPushToken }
}
