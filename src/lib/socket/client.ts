/**
 * Socket.IO 客户端封装
 */

import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from './types'

class SocketClient {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  /**
   * 连接到 WebSocket 服务器
   */
  connect(url: string): void {
    if (this.socket?.connected) {
      console.log('[Socket] Already connected')
      return
    }

    console.log('[Socket] Connecting to:', url)

    this.socket = io(url, {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
      timeout: 10000,
    })

    // 连接成功
    this.socket.on('connect', () => {
      console.log('[Socket] Connected:', this.socket?.id)
      this.reconnectAttempts = 0
    })

    // 断开连接
    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })

    // 连接错误
    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error)
    })

    // 重连尝试
    this.socket.io.on('reconnect_attempt', (attempt) => {
      this.reconnectAttempts = attempt
      console.log(`[Socket] Reconnection attempt ${attempt}`)
    })

    // 重连成功
    this.socket.io.on('reconnect', () => {
      console.log('[Socket] Reconnected')
      this.reconnectAttempts = 0
    })

    // 重连失败
    this.socket.io.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed')
    })
  }

  /**
   * 断开连接
   */
  disconnect(): void {
    if (this.socket) {
      console.log('[Socket] Disconnecting...')
      this.socket.disconnect()
      this.socket = null
    }
  }

  /**
   * 订阅频道
   */
  subscribe(channels: ('teams' | 'tasks' | 'inbox' | 'all')[]): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot subscribe: not connected')
      return
    }

    console.log('[Socket] Subscribing to channels:', channels)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(this.socket.emit as any)('subscribe', { channels })
  }

  /**
   * 取消订阅频道
   */
  unsubscribe(channels: ('teams' | 'tasks' | 'inbox' | 'all')[]): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot unsubscribe: not connected')
      return
    }

    console.log('[Socket] Unsubscribing from channels:', channels)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(this.socket.emit as any)('unsubscribe', { channels })
  }

  /**
   * 获取团队数据
   */
  fetchTeams(): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot fetch teams: not connected')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(this.socket.emit as any)('teams:fetch')
  }

  /**
   * 获取任务数据
   */
  fetchTasks(): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot fetch tasks: not connected')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(this.socket.emit as any)('tasks:fetch')
  }

  /**
   * 获取消息数据
   */
  fetchInbox(): void {
    if (!this.socket?.connected) {
      console.warn('[Socket] Cannot fetch inbox: not connected')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(this.socket.emit as any)('inbox:fetch')
  }

  /**
   * 监听事件
   */
  on<E extends keyof ServerToClientEvents>(
    event: E,
    callback: ServerToClientEvents[E]
  ): void {
    if (this.socket) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this.socket.on as any)(event, callback)
    }
  }

  /**
   * 取消监听事件
   */
  off<E extends keyof ServerToClientEvents>(
    event: E,
    callback?: ServerToClientEvents[E]
  ): void {
    if (this.socket) {
      if (callback) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.socket.off as any)(event, callback)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.socket.off as any)(event)
      }
    }
  }

  /**
   * 检查是否已连接
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false
  }

  /**
   * 获取 Socket ID
   */
  getId(): string | undefined {
    return this.socket?.id
  }
}

// 导出单例并自动连接
export const socketClient = new SocketClient()

// 自动连接到服务器
if (typeof window !== 'undefined') {
  const serverUrl = process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin
  socketClient.connect(serverUrl)
  console.log('[Socket] Auto-connecting to:', serverUrl)
}
