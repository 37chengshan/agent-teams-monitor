import chokidar from 'chokidar'
import type { FSWatcher } from 'chokidar'
import { EventEmitter } from 'events'
import { logger } from '@/lib/utils/logger'
import { readJsonFile } from '../services/file-reader'
import { parseTeamFile, extractTeamIdFromPath, validateTeamData } from '../services/parser'
import { getTeamsPath } from '../services/claude-paths'
import type { Team, TeamConfigFile } from '@/lib/types'

/**
 * 团队监控器事件
 */
export interface TeamWatcherEvents {
  'team:added': (team: Team) => void
  'team:updated': (team: Team) => void
  'team:deleted': (teamId: string) => void
  'error': (error: Error) => void
}

/**
 * 团队文件监控器
 */
export class TeamWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null
  private teamsPath: string
  private teamCache = new Map<string, Team>()

  constructor() {
    super()
    this.teamsPath = getTeamsPath()
  }

  /**
   * 启动监控
   */
  async start(): Promise<void> {
    if (this.watcher) {
      logger.warn('TeamWatcher already started')
      return
    }

    logger.info(`Starting TeamWatcher for path: ${this.teamsPath}`)

    // 直接监控整个 teams 目录，在处理器中过滤 config.json
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
        logger.info('TeamWatcher ready')
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
        // 只处理 config.json 文件
        if (filepath.endsWith('config.json')) {
          this.handleFileAdd(filepath)
        }
      })
      .on('change', (filepath) => {
        // 只处理 config.json 文件
        if (filepath.endsWith('config.json')) {
          this.handleFileChange(filepath)
        }
      })
      .on('unlink', (filepath) => {
        // 只处理 config.json 文件
        if (filepath.endsWith('config.json')) {
          this.handleFileDelete(filepath)
        }
      })
      .on('error', (error: unknown) => {
        const err = error instanceof Error ? error : new Error(String(error))
        logger.error(`TeamWatcher error: ${err.message}`)
        this.emit('error', err)
      })
  }

  /**
   * 处理文件添加
   */
  private async handleFileAdd(filepath: string): Promise<void> {
    try {
      const result = await readJsonFile<TeamConfigFile>(filepath)

      if (!result.success || !result.data || !validateTeamData(result.data)) {
        logger.warn(`Invalid team file: ${filepath}`)
        return
      }

      const teamId = extractTeamIdFromPath(filepath, this.teamsPath)
      const team = parseTeamFile(teamId, filepath, result.data)

      this.teamCache.set(teamId, team)
      this.emit('team:added', team)

      logger.info(`Team added: ${team.name} (${teamId})`)
    } catch (error) {
      logger.error(`Error handling team file add: ${error}`)
    }
  }

  /**
   * 处理文件变更
   */
  private async handleFileChange(filepath: string): Promise<void> {
    try {
      const result = await readJsonFile<TeamConfigFile>(filepath)

      if (!result.success || !result.data || !validateTeamData(result.data)) {
        logger.warn(`Invalid team file: ${filepath}`)
        return
      }

      const teamId = extractTeamIdFromPath(filepath, this.teamsPath)
      const team = parseTeamFile(teamId, filepath, result.data)

      this.teamCache.set(teamId, team)
      this.emit('team:updated', team)

      logger.debug(`Team updated: ${team.name} (${teamId})`)
    } catch (error) {
      logger.error(`Error handling team file change: ${error}`)
    }
  }

  /**
   * 处理文件删除
   */
  private handleFileDelete(filepath: string): void {
    try {
      const teamId = extractTeamIdFromPath(filepath, this.teamsPath)

      this.teamCache.delete(teamId)
      this.emit('team:deleted', teamId)

      logger.info(`Team deleted: ${teamId}`)
    } catch (error) {
      logger.error(`Error handling team file delete: ${error}`)
    }
  }

  /**
   * 获取所有缓存的团队
   */
  getAllTeams(): Team[] {
    return Array.from(this.teamCache.values())
  }

  /**
   * 获取单个团队
   */
  getTeam(teamId: string): Team | undefined {
    return this.teamCache.get(teamId)
  }

  /**
   * 停止监控
   */
  async stop(): Promise<void> {
    if (!this.watcher) {
      return
    }

    logger.info('Stopping TeamWatcher')

    await this.watcher.close()
    this.watcher = null
    this.teamCache.clear()
  }
}
