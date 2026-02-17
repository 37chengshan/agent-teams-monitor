/**
 * Connection Store - WebSocket 连接状态管理
 */

import { create } from 'zustand'

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error'

interface ConnectionStore {
  // 状态
  status: ConnectionStatus
  error: string | null
  reconnectAttempts: number
  lastConnectedAt: Date | null

  // Actions
  setStatus: (status: ConnectionStatus) => void
  setError: (error: string | null) => void
  incrementReconnectAttempts: () => void
  resetReconnectAttempts: () => void
  setLastConnectedAt: (date: Date) => void
  reconnect: () => Promise<void>
}

export const useConnectionStore = create<ConnectionStore>((set) => ({
  // 初始状态
  status: 'disconnected',
  error: null,
  reconnectAttempts: 0,
  lastConnectedAt: null,

  // 设置连接状态
  setStatus: (status) => set({ status }),

  // 设置错误
  setError: (error) => set({ error }),

  // 增加重连尝试次数
  incrementReconnectAttempts: () =>
    set((state) => ({
      reconnectAttempts: state.reconnectAttempts + 1,
    })),

  // 重置重连尝试次数
  resetReconnectAttempts: () => set({ reconnectAttempts: 0 }),

  // 设置最后连接时间
  setLastConnectedAt: (date) => set({ lastConnectedAt: date }),

  // 重新连接
  reconnect: async () => {
    const { socketClient } = await import('@/lib/socket')
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:3000'

    set({ status: 'connecting', error: null })

    try {
      socketClient.disconnect()
      socketClient.connect(wsUrl)
    } catch (error) {
      set({
        status: 'error',
        error: error instanceof Error ? error.message : '连接失败',
      })
    }
  },
}))
