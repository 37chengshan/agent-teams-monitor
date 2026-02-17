/**
 * Socket.IO 类型定义
 */

import type { Team } from '@/lib/types/team'
import type { Task } from '@/lib/types/task'
import type { InboxMessage } from '@/lib/types/inbox'

/**
 * 服务端到客户端事件
 */
export interface ServerToClientEvents {
  // Socket.IO 内置事件
  connect: () => void
  disconnect: (reason: string) => void
  error: (error: { message: string; code?: string }) => void

  // 连接确认
  connected: (data: { clientId: string; timestamp: number }) => void

  // 团队数据更新
  'teams:updated': (teams: Team[]) => void
  'team:created': (data: { team: Team; timestamp: number }) => void
  'team:updated': (data: { team: Team; timestamp: number }) => void
  'team:deleted': (data: { teamId: string; timestamp: number }) => void

  // 任务数据更新
  'tasks:updated': (tasks: Task[]) => void
  'task:created': (data: { task: Task; timestamp: number }) => void
  'task:updated': (data: { task: Task; timestamp: number }) => void
  'task:deleted': (data: { taskId: string; timestamp: number }) => void

  // Inbox 消息
  'inbox:message': (data: { message: InboxMessage; timestamp: number }) => void
  'inbox:updated': (messages: InboxMessage[]) => void

  // 系统事件
  'activity:new': (activity: { message: string; timestamp: Date }) => void
  'metrics:updated': (metrics: { [key: string]: number }) => void

  // 心跳响应
  pong: () => void
}

/**
 * 客户端到服务端事件
 */
export interface ClientToServerEvents {
  // 订阅管理
  subscribe: (data: { channels: ('teams' | 'tasks' | 'inbox' | 'all')[] }) => void
  unsubscribe: (data: { channels: ('teams' | 'tasks' | 'inbox' | 'all')[] }) => void

  // 数据获取
  'teams:fetch': () => void
  'tasks:fetch': () => void
  'inbox:fetch': () => void
  getTeam: (teamId: string) => void

  // 心跳
  ping: () => void
}
