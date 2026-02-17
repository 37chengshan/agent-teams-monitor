'use client'

/**
 * Header - 页面头部组件
 */

import { useConnectionStore } from '@/lib/stores/connection-store'
import { StatusIndicator } from '@/components/animations/status-indicator'
import { Button } from '@/components/ui/button'
import { RefreshCw, Settings } from 'lucide-react'
import { useState } from 'react'

export function Header() {
  const { status, reconnect } = useConnectionStore()
  const connected = status === 'connected'
  const [reconnecting, setReconnecting] = useState(false)

  const handleReconnect = async () => {
    setReconnecting(true)
    try {
      await reconnect()
    } finally {
      setReconnecting(false)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* 左侧：标题 */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">Agent Teams Monitor</h1>
        </div>

        {/* 右侧：状态和操作 */}
        <div className="flex items-center gap-4">
          {/* 连接状态 */}
          <div className="flex items-center gap-2">
            <StatusIndicator
              status={connected ? 'online' : 'offline'}
              showPulse={connected}
            />
            <span className="text-sm font-medium">
              {connected ? '已连接' : '未连接'}
            </span>
          </div>

          {/* 重新连接按钮 */}
          {!connected && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReconnect}
              disabled={reconnecting}
            >
              <RefreshCw className={`h-4 w-4 ${reconnecting ? 'animate-spin' : ''}`} />
              <span className="ml-2">重新连接</span>
            </Button>
          )}

          {/* 设置按钮（预留） */}
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
