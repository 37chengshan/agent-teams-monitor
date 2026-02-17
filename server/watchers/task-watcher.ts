import chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import { EventEmitter } from 'events'
import { logger } from '@/lib/utils/logger'
import { readJsonFile } from '../services/file-reader'
import { parseTaskFile, extractTaskIdFromPath, validateTaskData } from '../services/parser'
import { getTasksPath } from '../services/claude-paths'
import type { Task, TaskFile } from '@/lib/types'

/**
 * 任务监控器事件
 */
export interface TaskWatcherEvents {
  'task:added': (task: Task) => void
  'task:updated': (task: Task) => void
  'task:deleted': (taskId: string) => void
  'error': (error: Error) => void
}

/**
 * 任务文件监控器
 */
export class TaskWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null
  private tasksPath: string
  private taskCache = new Map<string, Task>()

  constructor() {
    super()
    this.tasksPath = getTasksPath()
  }

  /**
   * 启动监控
   */
  async start(): Promise<void> {
    if (this.watcher) {
      logger.warn('TaskWatcher already started')
      return
    }

    logger.info(`Starting TaskWatcher for path: ${this.tasksPath}`)

    this.watcher = chokidar.watch(`${this.tasksPath}/*/*.json`, {
      persistent: true,
      ignoreInitial: false,
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
        logger.info('TaskWatcher ready')
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
      .on('add', this.handleFileAdd.bind(this))
      .on('change', this.handleFileChange.bind(this))
      .on('unlink', this.handleFileDelete.bind(this))
      .on('error', (error: unknown) => {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.error(`TaskWatcher error: ${err.message}`)
        this.emit('error', err)
      })
  }

  /**
   * 处理文件添加
   */
  private async handleFileAdd(filepath: string): Promise<void> {
    try {
      const result = await readJsonFile<TaskFile>(filepath)

      if (!result.success || !result.data || !validateTaskData(result.data)) {
        logger.warn(`Invalid task file: ${filepath}`)
        return
      }

      const taskId = extractTaskIdFromPath(filepath)
      const task = parseTaskFile(taskId, filepath, result.data)

      this.taskCache.set(taskId, task)
      this.emit('task:added', task)

      logger.info(`Task added: ${task.subject} (${taskId})`)
    } catch (error) {
      logger.error(`Error handling task file add: ${error}`)
    }
  }

  /**
   * 处理文件变更
   */
  private async handleFileChange(filepath: string): Promise<void> {
    try {
      const result = await readJsonFile<TaskFile>(filepath)

      if (!result.success || !result.data || !validateTaskData(result.data)) {
        logger.warn(`Invalid task file: ${filepath}`)
        return
      }

      const taskId = extractTaskIdFromPath(filepath)
      const task = parseTaskFile(taskId, filepath, result.data)

      this.taskCache.set(taskId, task)
      this.emit('task:updated', task)

      logger.debug(`Task updated: ${task.subject} (${taskId})`)
    } catch (error) {
      logger.error(`Error handling task file change: ${error}`)
    }
  }

  /**
   * 处理文件删除
   */
  private handleFileDelete(filepath: string): void {
    try {
      const taskId = extractTaskIdFromPath(filepath)

      this.taskCache.delete(taskId)
      this.emit('task:deleted', taskId)

      logger.info(`Task deleted: ${taskId}`)
    } catch (error) {
      logger.error(`Error handling task file delete: ${error}`)
    }
  }

  /**
   * 获取所有缓存的任务
   */
  getAllTasks(): Task[] {
    return Array.from(this.taskCache.values())
  }

  /**
   * 获取单个任务
   */
  getTask(taskId: string): Task | undefined {
    return this.taskCache.get(taskId)
  }

  /**
   * 按团队 ID 获取任务
   */
  getTasksByTeam(teamId: string): Task[] {
    return Array.from(this.taskCache.values()).filter(
      (task) => task.filepath.includes(`/${teamId}/`)
    )
  }

  /**
   * 停止监控
   */
  async stop(): Promise<void> {
    if (!this.watcher) {
      return
    }

    logger.info('Stopping TaskWatcher')

    await this.watcher.close()
    this.watcher = null
    this.taskCache.clear()
  }
}
