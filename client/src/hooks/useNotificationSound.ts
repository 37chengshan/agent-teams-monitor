'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useSettingsStore } from '@/lib/stores/settings-store'

export function useNotificationSound() {
  const soundEnabled = useSettingsStore((state) => state.soundEnabled)
  const audioContextRef = useRef<AudioContext | null>(null)

  const playSound = useCallback(() => {
    if (!soundEnabled) return

    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const audioContext = audioContextRef.current

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.2)
    } catch (error) {
      console.error('Failed to play notification sound:', error)
    }
  }, [soundEnabled])

  return { playSound }
}
