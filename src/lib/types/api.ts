/**
 * REST API 响应格式
 */
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}

/**
 * WebSocket 频道类型
 */
export type WebSocketChannel = 'teams' | 'tasks' | 'inbox' | 'all'

// 导出 Socket.IO 类型
export type { ServerToClientEvents, ClientToServerEvents } from '@/lib/socket/types'
