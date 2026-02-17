import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/socket/types'
import { logger } from '@/lib/utils/logger'
import { fileWatcherManager } from '../watchers'

/**
 * Socket.IO 服务器实例
 */
let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null = null

/**
 * 创建并配置 Socket.IO 服务器
 */
export function createSocketServer(httpServer: HTTPServer): SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents
> {
  if (io) {
    logger.warn('Socket.IO server already created')
    return io
  }

  logger.info('Creating Socket.IO server')

  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGINS?.split(',') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      methods: process.env.CORS_METHODS?.split(',') || ['GET', 'POST'],
      credentials: true
    },
    transports: ['websocket', 'polling'],
    pingTimeout: Number(process.env.SOCKET_PING_TIMEOUT) || 60000,
    pingInterval: Number(process.env.SOCKET_PING_INTERVAL) || 25000
  })

  setupSocketHandlers(io)

  return io
}

/**
 * 获取 Socket.IO 服务器实例
 */
export function getSocketServer(): SocketIOServer<ClientToServerEvents, ServerToClientEvents> | null {
  return io
}

/**
 * 设置 Socket.IO 事件处理器
 */
function setupSocketHandlers(
  socketServer: SocketIOServer<ClientToServerEvents, ServerToClientEvents>
): void {
  socketServer.on('connection', (socket) => {
    const clientId = socket.id
    logger.info(`Client connected: ${clientId}`)

    // 发送连接确认
    socket.emit('connected', {
      clientId,
      timestamp: Date.now()
    })

    // 发送初始数据
    if (fileWatcherManager.isActive()) {
      const allTeams = fileWatcherManager.getAllTeams()
      const allTasks = fileWatcherManager.getAllTasks()
      const allMessages = fileWatcherManager.getAllMessages()

      logger.info(`Sending initial data to ${clientId}: ${allTeams.length} teams, ${allTasks.length} tasks, ${allMessages.length} messages`)

      // 发送所有团队
      socket.emit('teams:updated', allTeams)

      // 发送所有任务
      socket.emit('tasks:updated', allTasks)

      // 发送所有消息
      socket.emit('inbox:updated', allMessages)
    }

    // 处理订阅
    socket.on('subscribe', (data) => {
      const { channels } = data
      logger.debug(`Client ${clientId} subscribing to: ${channels.join(', ')}`)
      channels.forEach((channel) => {
        socket.join(channel)
      })
    })

    // 处理取消订阅
    socket.on('unsubscribe', (data) => {
      const { channels } = data
      logger.debug(`Client ${clientId} unsubscribing from: ${channels.join(', ')}`)
      channels.forEach((channel) => {
        socket.leave(channel)
      })
    })

    // 处理团队数据请求
    socket.on('teams:fetch', () => {
      logger.debug(`Client ${clientId} fetching teams`)
      // 发送当前团队数据
      const allTeams = fileWatcherManager.getAllTeams()
      socket.emit('teams:updated', allTeams)
    })

    // 处理任务数据请求
    socket.on('tasks:fetch', () => {
      logger.debug(`Client ${clientId} fetching tasks`)
      // 发送当前任务数据
      const allTasks = fileWatcherManager.getAllTasks()
      socket.emit('tasks:updated', allTasks)
    })

    // 处理消息数据请求
    socket.on('inbox:fetch', () => {
      logger.debug(`Client ${clientId} fetching inbox`)
      // 发送当前消息数据
      const allMessages = fileWatcherManager.getAllMessages()
      socket.emit('inbox:updated', allMessages)
    })

    // 处理心跳
    socket.on('ping', () => {
      socket.emit('pong')
    })

    // 处理断开连接
    socket.on('disconnect', (reason) => {
      logger.info(`Client disconnected: ${clientId} (${reason})`)
    })
  })

  logger.info('Socket.IO event handlers configured')
}

/**
 * 广播事件到指定频道
 */
export function broadcastToChannel<E extends keyof ServerToClientEvents>(
  channel: string,
  event: E,
  ...data: Parameters<ServerToClientEvents[E]>
): void {
  if (!io) {
    logger.warn('Socket.IO server not initialized')
    return
  }

  io.to(channel).emit(event, ...data)
  logger.debug(`Broadcasted to ${channel}: ${event}`)
}

/**
 * 广播事件到所有连接的客户端
 */
export function broadcastToAll<E extends keyof ServerToClientEvents>(
  event: E,
  ...data: Parameters<ServerToClientEvents[E]>
): void {
  if (!io) {
    logger.warn('Socket.IO server not initialized')
    return
  }

  io.emit(event, ...data)
  logger.debug(`Broadcasted to all: ${event}`)
}

/**
 * 关闭 Socket.IO 服务器
 */
export async function closeSocketServer(): Promise<void> {
  if (!io) {
    return
  }

  logger.info('Closing Socket.IO server')

  await io.close()
  io = null

  logger.info('Socket.IO server closed')
}
