import { EventEmitter } from 'events'
import { logger } from '@/lib/utils/logger'
import { TeamWatcher } from './team-watcher'
import { TaskWatcher } from './task-watcher'
import { InboxWatcher } from './inbox-watcher'
import type { Team, Task, InboxMessage } from '@/lib/types'

/**
 * 文件监控管理器
 * 整合所有监控器并提供统一接口
 */
export class FileWatcherManager extends EventEmitter {
  private teamWatcher: TeamWatcher
  private taskWatcher: TaskWatcher
  private inboxWatcher: InboxWatcher
  private isStarted = false

  constructor() {
    super()

    this.teamWatcher = new TeamWatcher()
    this.taskWatcher = new TaskWatcher()
    this.inboxWatcher = new InboxWatcher()

    this.setupForwarding()
  }

  /**
   * 设置事件转发
   * 将各个监控器的事件转发到管理器
   */
  private setupForwarding(): void {
    // Team 事件转发
    this.teamWatcher.on('team:added', (team) => {
      this.emit('team:added', team)
    })

    this.teamWatcher.on('team:updated', (team) => {
      this.emit('team:updated', team)
    })

    this.teamWatcher.on('team:deleted', (teamId) => {
      this.emit('team:deleted', teamId)
    })

    this.teamWatcher.on('error', (error) => {
      this.emit('error', error)
    })

    // Task 事件转发
    this.taskWatcher.on('task:added', (task) => {
      this.emit('task:added', task)
    })

    this.taskWatcher.on('task:updated', (task) => {
      this.emit('task:updated', task)
    })

    this.taskWatcher.on('task:deleted', (taskId) => {
      this.emit('task:deleted', taskId)
    })

    this.taskWatcher.on('error', (error) => {
      this.emit('error', error)
    })

    // Inbox 事件转发
    this.inboxWatcher.on('inbox:updated', (teamId, recipient, messages) => {
      this.emit('inbox:updated', teamId, recipient, messages)
    })

    this.inboxWatcher.on('message:added', (message) => {
      this.emit('message:added', message)
    })

    this.inboxWatcher.on('error', (error) => {
      this.emit('error', error)
    })
  }

  /**
   * 启动所有监控器
   */
  async start(): Promise<void> {
    if (this.isStarted) {
      logger.warn('FileWatcherManager already started')
      return
    }

    logger.info('Starting FileWatcherManager')

    try {
      await Promise.all([
        this.teamWatcher.start(),
        this.taskWatcher.start(),
        this.inboxWatcher.start()
      ])

      this.isStarted = true
      logger.info('FileWatcherManager started successfully')
    } catch (error) {
      logger.error(`Failed to start FileWatcherManager: ${error}`)
      throw error
    }
  }

  /**
   * 停止所有监控器
   */
  async stop(): Promise<void> {
    if (!this.isStarted) {
      return
    }

    logger.info('Stopping FileWatcherManager')

    try {
      await Promise.all([
        this.teamWatcher.stop(),
        this.taskWatcher.stop(),
        this.inboxWatcher.stop()
      ])

      this.isStarted = false
      logger.info('FileWatcherManager stopped successfully')
    } catch (error) {
      logger.error(`Failed to stop FileWatcherManager: ${error}`)
      throw error
    }
  }

  /**
   * 获取所有团队
   */
  getAllTeams(): Team[] {
    return this.teamWatcher.getAllTeams()
  }

  /**
   * 获取所有任务
   */
  getAllTasks(): Task[] {
    return this.taskWatcher.getAllTasks()
  }

  /**
   * 获取所有消息
   */
  getAllMessages(): InboxMessage[] {
    return this.inboxWatcher.getAllMessages()
  }

  /**
   * 获取指定团队的任务
   */
  getTeamTasks(teamId: string): Task[] {
    return this.taskWatcher.getTasksByTeam(teamId)
  }

  /**
   * 获取指定团队的消息
   */
  getTeamMessages(teamId: string): InboxMessage[] {
    return this.inboxWatcher.getTeamMessages(teamId)
  }

  /**
   * 检查是否已启动
   */
  isActive(): boolean {
    return this.isStarted
  }
}

// 导出单例实例
export const fileWatcherManager = new FileWatcherManager()

// 导出所有监控器类
export { TeamWatcher } from './team-watcher'
export { TaskWatcher } from './task-watcher'
export { InboxWatcher } from './inbox-watcher'
