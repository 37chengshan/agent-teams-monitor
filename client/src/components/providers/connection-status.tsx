'use client'

import { memo } from 'react'
import { Wifi, WifiOff, Loader2, RefreshCw } from 'lucide-react'

interface ConnectionStatusProps {
  isConnected: boolean
  isConnecting?: boolean
  error?: string | null
  onReconnect?: () => void
}

export const ConnectionStatus = memo(function ConnectionStatus({
  isConnected,
  isConnecting = false,
  error,
  onReconnect,
}: ConnectionStatusProps) {
  if (isConnecting) {
    return (
      <div className="flex items-center gap-2 text-amber-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">连接中...</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-red-400">
          <WifiOff className="w-4 h-4" />
          <span className="text-sm">已断开</span>
        </div>
        {onReconnect && (
          <button
            onClick={onReconnect}
            className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            重连
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-live">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-live opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-live" />
      </span>
      <span className="text-sm">已连接</span>
    </div>
  )
})
