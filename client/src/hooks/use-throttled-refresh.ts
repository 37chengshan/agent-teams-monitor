'use client'

import { useEffect, useRef, useCallback } from 'react'

interface UseThrottledRefreshOptions {
  interval: number
  enabled?: boolean
  onRefresh: () => void
}

export function useThrottledRefresh({
  interval,
  enabled = true,
  onRefresh,
}: UseThrottledRefreshOptions) {
  const lastRefreshRef = useRef<number>(0)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const throttledRefresh = useCallback(() => {
    const now = Date.now()
    const timeSinceLastRefresh = now - lastRefreshRef.current

    if (timeSinceLastRefresh >= interval) {
      lastRefreshRef.current = now
      onRefresh()
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => {
        lastRefreshRef.current = Date.now()
        onRefresh()
      }, interval - timeSinceLastRefresh)
    }
  }, [interval, onRefresh])

  useEffect(() => {
    if (!enabled) return

    const intervalId = setInterval(throttledRefresh, interval)

    return () => {
      clearInterval(intervalId)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [enabled, interval, throttledRefresh])

  return {
    refresh: throttledRefresh,
  }
}
