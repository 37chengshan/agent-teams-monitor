import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  // Message Notification Settings
  autoScroll: boolean
  soundEnabled: boolean
  desktopNotifications: boolean

  // Message Filter Settings
  showReadMessages: boolean
  keywordFilter: string
  regexFilter: string

  // Layout Display Settings
  fontSize: number
  layoutMode: 'compact' | 'comfortable'
  theme: 'dark' | 'light'

  // Connection & Sync Settings
  retryCount: number
  heartbeatInterval: number

  // Actions
  setAutoScroll: (value: boolean) => void
  setSoundEnabled: (value: boolean) => void
  setDesktopNotifications: (value: boolean) => void
  setShowReadMessages: (value: boolean) => void
  setKeywordFilter: (value: string) => void
  setRegexFilter: (value: string) => void
  setFontSize: (value: number) => void
  setLayoutMode: (value: 'compact' | 'comfortable') => void
  setTheme: (value: 'dark' | 'light') => void
  setRetryCount: (value: number) => void
  setHeartbeatInterval: (value: number) => void
  resetSettings: () => void
}

const defaultSettings = {
  // Message Notification Settings
  autoScroll: true,
  soundEnabled: true,
  desktopNotifications: false,

  // Message Filter Settings
  showReadMessages: true,
  keywordFilter: '',
  regexFilter: '',

  // Layout Display Settings
  fontSize: 14,
  layoutMode: 'comfortable' as const,
  theme: 'dark' as const,

  // Connection & Sync Settings
  retryCount: 3,
  heartbeatInterval: 30,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,

      // Message Notification Settings
      setAutoScroll: (value) => set({ autoScroll: value }),
      setSoundEnabled: (value) => set({ soundEnabled: value }),
      setDesktopNotifications: (value) => set({ desktopNotifications: value }),

      // Message Filter Settings
      setShowReadMessages: (value) => set({ showReadMessages: value }),
      setKeywordFilter: (value) => set({ keywordFilter: value }),
      setRegexFilter: (value) => set({ regexFilter: value }),

      // Layout Display Settings
      setFontSize: (value) => set({ fontSize: value }),
      setLayoutMode: (value) => set({ layoutMode: value }),
      setTheme: (value) => set({ theme: value }),

      // Connection & Sync Settings
      setRetryCount: (value) => set({ retryCount: value }),
      setHeartbeatInterval: (value) => set({ heartbeatInterval: value }),

      // Reset
      resetSettings: () => set(defaultSettings),
    }),
    {
      name: 'agent-teams-settings',
    }
  )
)
