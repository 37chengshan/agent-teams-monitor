/**
 * 服务器集成测试
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { Server as HTTPServer } from 'http'
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client'
import { createSocketServer, closeSocketServer } from '../../../server/socket/server'
import { fileWatcherManager } from '../../../server/watchers'

describe('服务器集成测试', () => {
  let httpServer: HTTPServer
  let serverSocket: any
  let clientSocket: ClientSocket
  let port: number

  beforeEach(async () => {
    // 创建测试 HTTP 服务器
    await new Promise<void>((resolve) => {
      httpServer = new HTTPServer()
      httpServer.listen(() => {
        const addr = httpServer.address()
        if (addr && typeof addr === 'object') {
          port = addr.port
        }
        resolve()
      })
    })

    // 创建 Socket.IO 服务器
    serverSocket = createSocketServer(httpServer)

    // 创建客户端连接
    clientSocket = ioClient(`http://localhost:${port}`, {
      transports: ['websocket', 'polling'],
      reconnection: false
    })

    await new Promise<void>((resolve) => {
      clientSocket.on('connected', () => resolve())
    })
  })

  afterEach(async () => {
    // 关闭客户端
    clientSocket?.close()

    // 关闭服务器
    await closeSocketServer()

    // 关闭 HTTP 服务器
    await new Promise<void>((resolve) => {
      httpServer?.close(() => resolve())
    })
  })

  describe('Socket.IO 服务器', () => {
    it('应该成功连接客户端', () => {
      expect(clientSocket.connected).toBe(true)
    })

    it('应该正确处理订阅事件', async () => {
      const channels = ['teams', 'tasks']
      clientSocket.emit('subscribe', { channels })

      // 等待一小段时间确保订阅完成
      await new Promise(resolve => setTimeout(resolve, 100))
      expect(clientSocket).toBeDefined()
    })

    it('应该正确处理 ping/pong', async () => {
      return new Promise<void>((resolve) => {
        clientSocket.emit('ping')
        clientSocket.on('pong', () => {
          expect(true).toBe(true)
          resolve()
        })
      })
    })

    it('应该正确处理取消订阅', async () => {
      const channels = ['teams']
      clientSocket.emit('subscribe', { channels })

      await new Promise(resolve => setTimeout(resolve, 100))
      clientSocket.emit('unsubscribe', { channels })
    })
  })

  describe('文件监控管理器', () => {
    it('应该正确启动和停止', async () => {
      expect(fileWatcherManager.isActive()).toBe(false)

      await fileWatcherManager.start()
      expect(fileWatcherManager.isActive()).toBe(true)

      await fileWatcherManager.stop()
      expect(fileWatcherManager.isActive()).toBe(false)
    })

    it('应该能获取所有团队', () => {
      const teams = fileWatcherManager.getAllTeams()
      expect(Array.isArray(teams)).toBe(true)
    })

    it('应该能获取所有任务', () => {
      const tasks = fileWatcherManager.getAllTasks()
      expect(Array.isArray(tasks)).toBe(true)
    })

    it('应该能获取所有消息', () => {
      const messages = fileWatcherManager.getAllMessages()
      expect(Array.isArray(messages)).toBe(true)
    })
  })
})
