'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSettingsStore } from '@/lib/stores/settings-store'

export function useDesktopNotifications() {
  const desktopNotificationsEnabled = useSettingsStore((state) => state.desktopNotifications)
  const notificationPermissionRef = useRef<NotificationPermission>('default')

  useEffect(() => {
    if (desktopNotificationsEnabled && notificationPermissionRef.current === 'default') {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission
      })
    }
  }, [desktopNotificationsEnabled])

  const showNotification = useCallback((title: string, body: string, icon?: string) => {
    if (!desktopNotificationsEnabled) return
    if (notificationPermissionRef.current !== 'granted') {
      Notification.requestPermission().then((permission) => {
        notificationPermissionRef.current = permission
        if (permission === 'granted') {
          new Notification(title, { body, icon })
        }
      })
      return
    }

    try {
      new Notification(title, {
        body,
        icon: icon || '/favicon.ico',
        tag: 'agent-teams-notification',
      })
    } catch (error) {
      console.error('Failed to show desktop notification:', error)
    }
  }, [desktopNotificationsEnabled])

  return { showNotification }
}
