import { getSocketServer, broadcastToChannel, broadcastToAll } from './server'
import { fileWatcherManager } from '../watchers'
import { logger } from '@/lib/utils/logger'
import type { Team, Task, InboxMessage } from '@/lib/types'

/**
 * 设置文件监控事件处理器
 * 将文件变化通过 WebSocket 广播给客户端
 */
export function setupFileWatchHandlers(): void {
  const io = getSocketServer()

  if (!io) {
    logger.warn('Socket.IO server not initialized, skipping file watch handlers')
    return
  }

  logger.info('Setting up file watch handlers')

  // ========== Team 事件处理 ==========

  fileWatcherManager.on('team:added', (team: Team) => {
    logger.debug(`Team added: ${team.id}`)
    const data = { team, timestamp: Date.now() }
    broadcastToChannel('teams', 'team:updated', data)
    broadcastToChannel('all', 'team:updated', data)
  })

  fileWatcherManager.on('team:updated', (team: Team) => {
    logger.debug(`Team updated: ${team.id}`)
    const data = { team, timestamp: Date.now() }
    broadcastToChannel('teams', 'team:updated', data)
    broadcastToChannel('all', 'team:updated', data)
  })

  fileWatcherManager.on('team:deleted', (teamId: string) => {
    logger.debug(`Team deleted: ${teamId}`)
    const data = { teamId, timestamp: Date.now() }
    broadcastToChannel('teams', 'team:deleted', data)
    broadcastToChannel('all', 'team:deleted', data)
  })

  // ========== Task 事件处理 ==========

  fileWatcherManager.on('task:added', (task: Task) => {
    logger.debug(`Task added: ${task.id}`)
    const data = { task, timestamp: Date.now() }
    broadcastToChannel('tasks', 'task:updated', data)
    broadcastToChannel('all', 'task:updated', data)
  })

  fileWatcherManager.on('task:updated', (task: Task) => {
    logger.debug(`Task updated: ${task.id}`)
    const data = { task, timestamp: Date.now() }
    broadcastToChannel('tasks', 'task:updated', data)
    broadcastToChannel('all', 'task:updated', data)
  })

  fileWatcherManager.on('task:deleted', (taskId: string) => {
    logger.debug(`Task deleted: ${taskId}`)
    const data = { taskId, timestamp: Date.now() }
    broadcastToChannel('tasks', 'task:deleted', data)
    broadcastToChannel('all', 'task:deleted', data)
  })

  // ========== Inbox 事件处理 ==========

  fileWatcherManager.on('message:added', (message: InboxMessage) => {
    logger.debug(`Message added from ${message.from} to ${message.recipient}`)
    const data = { message, timestamp: Date.now() }
    broadcastToChannel('inbox', 'inbox:message', data)
    broadcastToChannel('all', 'inbox:message', data)
  })

  fileWatcherManager.on('inbox:updated', (teamId: string, recipient: string, messages: InboxMessage[]) => {
    logger.debug(`Inbox updated for team ${teamId}, recipient ${recipient}`)
    // 广播所有消息更新
    messages.forEach((message) => {
      const data = { message, timestamp: Date.now() }
      broadcastToChannel('inbox', 'inbox:message', data)
      broadcastToChannel('all', 'inbox:message', data)
    })
  })

  // ========== 错误处理 ==========

  fileWatcherManager.on('error', (error: Error) => {
    logger.error(`File watcher error: ${error.message}`)
    broadcastToAll('error', {
      message: error.message,
      code: 'FILE_WATCHER_ERROR'
    })
  })

  logger.info('File watch handlers configured successfully')
}

/**
 * 清理文件监控事件处理器
 */
export function cleanupFileWatchHandlers(): void {
  logger.info('Cleaning up file watch handlers')
  fileWatcherManager.removeAllListeners()
}
