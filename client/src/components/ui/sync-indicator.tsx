'use client'

import { memo } from 'react'
import { RefreshCw, Check } from 'lucide-react'

interface SyncIndicatorProps {
  isSyncing: boolean
  lastSyncTime?: Date
}

export const SyncIndicator = memo(function SyncIndicator({ isSyncing, lastSyncTime }: SyncIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {isSyncing ? (
        <>
          <RefreshCw className="w-3 h-3 text-accent-primary animate-spin" />
          <span className="text-accent-primary">同步中...</span>
        </>
      ) : lastSyncTime ? (
        <>
          <Check className="w-3 h-3 text-accent-success" />
          <span className="text-slate-500">
            最后同步: {formatTime(lastSyncTime)}
          </span>
        </>
      ) : null}
    </div>
  )
})
