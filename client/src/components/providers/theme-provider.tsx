'use client'

import { useEffect, memo } from 'react'
import { useSettingsStore } from '@/lib/stores/settings-store'

export const ThemeProvider = memo(function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <>{children}</>
})
