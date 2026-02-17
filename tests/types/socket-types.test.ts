/**
 * Socket.IO 类型验证测试
 * 确保客户端和服务端类型定义匹配
 */

import { describe, it, expect } from 'vitest'
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/socket/types'
import type { Team, Task, InboxMessage } from '@/lib/types'

describe('Socket.IO 类型验证', () => {
  describe('ServerToClientEvents', () => {
    it('应该正确定义 connected 事件', () => {
      const handler: ServerToClientEvents['connected'] = (data) => {
        expect(typeof data.clientId).toBe('string')
        expect(typeof data.timestamp).toBe('number')
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 team:updated 事件', () => {
      const handler: ServerToClientEvents['team:updated'] = (data) => {
        expect(data.team).toBeDefined()
        expect(typeof data.timestamp).toBe('number')
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 task:updated 事件', () => {
      const handler: ServerToClientEvents['task:updated'] = (data) => {
        expect(data.task).toBeDefined()
        expect(typeof data.timestamp).toBe('number')
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 inbox:message 事件', () => {
      const handler: ServerToClientEvents['inbox:message'] = (data) => {
        expect(data.message).toBeDefined()
        expect(typeof data.timestamp).toBe('number')
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 error 事件', () => {
      const handler: ServerToClientEvents['error'] = (data) => {
        expect(typeof data.message).toBe('string')
        expect(data.code).toBeUndefined()
        expect(typeof data.code === 'string' || data.code === undefined).toBe(true)
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 teams:updated 事件', () => {
      const handler: ServerToClientEvents['teams:updated'] = (teams) => {
        expect(Array.isArray(teams)).toBe(true)
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 tasks:updated 事件', () => {
      const handler: ServerToClientEvents['tasks:updated'] = (tasks) => {
        expect(Array.isArray(tasks)).toBe(true)
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 inbox:updated 事件', () => {
      const handler: ServerToClientEvents['inbox:updated'] = (messages) => {
        expect(Array.isArray(messages)).toBe(true)
      }
      expect(handler).toBeDefined()
    })
  })

  describe('ClientToServerEvents', () => {
    it('应该正确定义 subscribe 事件', () => {
      const handler: ClientToServerEvents['subscribe'] = (data) => {
        expect(Array.isArray(data.channels)).toBe(true)
        expect(data.channels.every((c) => ['teams', 'tasks', 'inbox', 'all'].includes(c))).toBe(true)
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 unsubscribe 事件', () => {
      const handler: ClientToServerEvents['unsubscribe'] = (data) => {
        expect(Array.isArray(data.channels)).toBe(true)
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 teams:fetch 事件', () => {
      const handler: ClientToServerEvents['teams:fetch'] = () => {
        // 无参数
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 tasks:fetch 事件', () => {
      const handler: ClientToServerEvents['tasks:fetch'] = () => {
        // 无参数
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 inbox:fetch 事件', () => {
      const handler: ClientToServerEvents['inbox:fetch'] = () => {
        // 无参数
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 getTeam 事件', () => {
      const handler: ClientToServerEvents['getTeam'] = (teamId) => {
        expect(typeof teamId).toBe('string')
      }
      expect(handler).toBeDefined()
    })

    it('应该正确定义 ping 事件', () => {
      const handler: ClientToServerEvents['ping'] = () => {
        // 无参数
      }
      expect(handler).toBeDefined()
    })
  })

  describe('类型一致性', () => {
    it('所有事件参数应该有正确的类型', () => {
      // connected 事件
      type ConnectedData = Parameters<ServerToClientEvents['connected']>[0]
      const connectedData: ConnectedData = {
        clientId: 'test-id',
        timestamp: Date.now()
      }
      expect(typeof connectedData.clientId).toBe('string')
      expect(typeof connectedData.timestamp).toBe('number')

      // team:updated 事件
      type TeamUpdatedData = Parameters<ServerToClientEvents['team:updated']>[0]
      const teamUpdatedData: TeamUpdatedData = {
        team: {} as Team,
        timestamp: Date.now()
      }
      expect(teamUpdatedData.team).toBeDefined()
      expect(typeof teamUpdatedData.timestamp).toBe('number')

      // task:updated 事件
      type TaskUpdatedData = Parameters<ServerToClientEvents['task:updated']>[0]
      const taskUpdatedData: TaskUpdatedData = {
        task: {} as Task,
        timestamp: Date.now()
      }
      expect(taskUpdatedData.task).toBeDefined()
      expect(typeof taskUpdatedData.timestamp).toBe('number')

      // inbox:message 事件
      type InboxMessageData = Parameters<ServerToClientEvents['inbox:message']>[0]
      const inboxMessageData: InboxMessageData = {
        message: {} as InboxMessage,
        timestamp: Date.now()
      }
      expect(inboxMessageData.message).toBeDefined()
      expect(typeof inboxMessageData.timestamp).toBe('number')
    })
  })
})
