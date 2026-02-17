import chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import { EventEmitter } from 'events'
import path from 'path'
import { logger } from '@/lib/utils/logger'
import { readJsonFile } from '../services/file-reader'
import { parseInboxFile, extractRecipientFromPath, extractTeamIdFromPath } from '../services/parser'
import { getTeamsPath } from '../services/claude-paths'
import type { InboxMessage, InboxFile } from '@/lib/types'

/**
 * Inbox 监控器事件
 */
export interface InboxWatcherEvents {
  'inbox:updated': (teamId: string, recipient: string, messages: InboxMessage[]) => void
  'message:added': (message: InboxMessage) => void
  'error': (error: Error) => void
}

/**
 * Inbox 消息监控器
 */
export class InboxWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null
  private teamsPath: string
  private inboxCache = new Map<string, InboxMessage[]>()

  constructor() {
    super()
    this.teamsPath = getTeamsPath()
  }

  /**
   * 启动监控
   */
  async start(): Promise<void> {
    if (this.watcher) {
      logger.warn('InboxWatcher already started')
      return
    }

    logger.info(`Starting InboxWatcher for path: ${this.teamsPath}`)

    // 监控整个 teams 目录，在处理器中过滤 inbox 文件
    // 这种方法在 Windows 上更可靠
    this.watcher = chokidar.watch(this.teamsPath, {
      persistent: true,
      ignoreInitial: false,
      recursive: true,
      // 忽略 .lock 文件
      ignored: /\.lock$/,
      awaitWriteFinish: {
        stabilityThreshold: 200,
        pollInterval: 100
      }
    })

    this.setupHandlers()

    return new Promise((resolve) => {
      this.watcher?.on('ready', () => {
        logger.info('InboxWatcher ready')
        resolve()
      })
    })
  }

  /**
   * 设置事件处理器
   */
  private setupHandlers(): void {
    if (!this.watcher) return

    this.watcher
      .on('add', (filepath) => {
        // 只处理 inbox 目录中的 .json 文件
        if (this.isInboxFile(filepath)) {
          this.handleFileAdd(filepath)
        }
      })
      .on('change', (filepath) => {
        // 只处理 inbox 目录中的 .json 文件
        if (this.isInboxFile(filepath)) {
          this.handleFileChange(filepath)
        }
      })
      .on('unlink', (filepath) => {
        // 只处理 inbox 目录中的 .json 文件
        if (this.isInboxFile(filepath)) {
          this.handleFileDelete(filepath)
        }
      })
      .on('error', (error: unknown) => {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.error(`InboxWatcher error: ${err.message}`)
        this.emit('error', err)
      })
  }

  /**
   * 检查文件是否是 inbox 文件
   */
  private isInboxFile(filepath: string): boolean {
    // 转换路径分隔符以进行比较
    const normalizedPath = filepath.replace(/\\/g, '/')
    const normalizedTeamsPath = this.teamsPath.replace(/\\/g, '/')

    // 检查路径是否匹配 teams/*/inboxes/*.json 模式
    const pattern = new RegExp(`^${normalizedTeamsPath}/[^/]+/inboxes/[^/]+\\.json$`)
    const result = pattern.test(normalizedPath)

    // 调试日志
    if (normalizedPath.includes('.json')) {
      logger.debug(`Checking file: ${normalizedPath}, isInbox: ${result}`)
    }

    return result
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(teamId: string, recipient: string): string {
    return `${teamId}:${recipient}`
  }

  /**
   * 处理文件添加
   */
  private async handleFileAdd(filepath: string): Promise<void> {
    try {
      logger.info(`[InboxWatcher] File added: ${filepath}`)

      const result = await readJsonFile<InboxFile[]>(filepath)

      if (!result.success || !result.data || !Array.isArray(result.data)) {
        logger.warn(`Invalid inbox file: ${filepath}`)
        return
      }

      const teamId = extractTeamIdFromPath(filepath, this.teamsPath)
      const recipient = extractRecipientFromPath(filepath)

      const messages = parseInboxFile(teamId, recipient, filepath, result.data)
      const cacheKey = this.getCacheKey(teamId, recipient)

      this.inboxCache.set(cacheKey, messages)

      // 发送完整更新事件
      this.emit('inbox:updated', teamId, recipient, messages)

      // 如果有新消息，发送消息添加事件
      if (messages.length > 0) {
        const lastMessage = messages[messages.length - 1]
        this.emit('message:added', lastMessage)
      }

      logger.debug(`Inbox updated: ${teamId}/${recipient} (${messages.length} messages)`)
    } catch (error) {
      logger.error(`Error handling inbox file add: ${error}`)
    }
  }

  /**
   * 处理文件变更
   */
  private async handleFileChange(filepath: string): Promise<void> {
    try {
      const result = await readJsonFile<InboxFile[]>(filepath)

      if (!result.success || !result.data || !Array.isArray(result.data)) {
        logger.warn(`Invalid inbox file: ${filepath}`)
        return
      }

      const teamId = extractTeamIdFromPath(filepath, this.teamsPath)
      const recipient = extractRecipientFromPath(filepath)

      const messages = parseInboxFile(teamId, recipient, filepath, result.data)
      const cacheKey = this.getCacheKey(teamId, recipient)

      const oldMessages = this.inboxCache.get(cacheKey) || []
      this.inboxCache.set(cacheKey, messages)

      // 检查是否有新消息
      if (messages.length > oldMessages.length) {
        const newMessages = messages.slice(oldMessages.length)
        newMessages.forEach((msg) => {
          this.emit('message:added', msg)
        })
      }

      // 发送完整更新事件
      this.emit('inbox:updated', teamId, recipient, messages)

      logger.debug(`Inbox updated: ${teamId}/${recipient} (${messages.length} messages)`)
    } catch (error) {
      logger.error(`Error handling inbox file change: ${error}`)
    }
  }

  /**
   * 处理文件删除
   */
  private handleFileDelete(filepath: string): void {
    try {
      const teamId = extractTeamIdFromPath(filepath, this.teamsPath)
      const recipient = extractRecipientFromPath(filepath)
      const cacheKey = this.getCacheKey(teamId, recipient)

      this.inboxCache.delete(cacheKey)

      logger.debug(`Inbox deleted: ${teamId}/${recipient}`)
    } catch (error) {
      logger.error(`Error handling inbox file delete: ${error}`)
    }
  }

  /**
   * 获取指定收件人的消息
   */
  getMessages(teamId: string, recipient: string): InboxMessage[] {
    const cacheKey = this.getCacheKey(teamId, recipient)
    return this.inboxCache.get(cacheKey) || []
  }

  /**
   * 获取所有消息
   */
  getAllMessages(): InboxMessage[] {
    const allMessages: InboxMessage[] = []
    for (const messages of this.inboxCache.values()) {
      allMessages.push(...messages)
    }
    // 按时间排序
    return allMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * 获取指定团队的所有消息
   */
  getTeamMessages(teamId: string): InboxMessage[] {
    const teamMessages: InboxMessage[] = []
    for (const [cacheKey, messages] of this.inboxCache.entries()) {
      if (cacheKey.startsWith(`${teamId}:`)) {
        teamMessages.push(...messages)
      }
    }
    // 按时间排序
    return teamMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  }

  /**
   * 停止监控
   */
  async stop(): Promise<void> {
    if (!this.watcher) {
      return
    }

    logger.info('Stopping InboxWatcher')

    await this.watcher.close()
    this.watcher = null
    this.inboxCache.clear()
  }
}
