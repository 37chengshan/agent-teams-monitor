/**
 * 类型定义统一导出
 */
export * from './team'
export * from './task'
export * from './inbox'
export * from './agent'
export * from './api'

/**
 * 通用 API 响应格式
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
 * WebSocket 消息类型
 */
export type WebSocketMessageType =
  | 'agent:updated'
  | 'agent:created'
  | 'agent:deleted'
  | 'task:updated'
  | 'task:created'
  | 'message:new'
  | 'activity:new'
  | 'metrics:updated'

/**
 * WebSocket 消息
 */
export interface WebSocketMessage<T = unknown> {
  type: WebSocketMessageType
  data: T
  timestamp: Date
}
