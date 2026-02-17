/**
 * useSocket - Socket.IO 连接管理 Hook
 */

import { useEffect } from 'react'
import { socketClient } from '@/lib/socket'
import { useConnectionStore } from '@/lib/stores'

export function useSocket(url?: string) {
  const { setStatus, setLastConnectedAt } = useConnectionStore()

  useEffect(() => {
    // 连接到 WebSocket 服务器
    const wsUrl = url || process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'
    socketClient.connect(wsUrl)

    // 监听服务器发送的连接确认
    const handleConnected = (data: { clientId: string; timestamp: number }) => {
      setStatus('connected')
      setLastConnectedAt(new Date(data.timestamp))
      console.log('[useSocket] Connected:', data.clientId)
    }

    const handleError = (data: { message: string; code?: string }) => {
      setStatus('error')
      console.error('[useSocket] Error:', data.message)
    }

    socketClient.on('connected', handleConnected)
    socketClient.on('error', handleError)

    // 定期检查连接状态
    const checkInterval = setInterval(() => {
      const connected = socketClient.isConnected()
      if (!connected) {
        setStatus('disconnected')
      }
    }, 5000)

    // 清理函数
    return () => {
      clearInterval(checkInterval)
      socketClient.off('connected', handleConnected)
      socketClient.off('error', handleError)
    }
  }, [url, setStatus, setLastConnectedAt])

  return {
    isConnected: socketClient.isConnected(),
    socketId: socketClient.getId(),
  }
}
