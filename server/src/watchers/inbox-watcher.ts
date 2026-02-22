import chokidar, { FSWatcher } from 'chokidar'
import { EventEmitter } from 'events'
import * as fs from 'fs/promises'
import * as path from 'path'
import * as os from 'os'
import { createLogger } from '../logger.js'

const logger = createLogger('InboxWatcher')

export interface InboxWatcherConfig {
  watchPath?: string
  teamsPath?: string
  stableThreshold?: number
  pollInterval?: number
}

export interface InboxFile {
  teamId: string
  recipient: string
  filepath: string
  content: string
}

export class InboxWatcher extends EventEmitter {
  private watcher: FSWatcher | null = null
  private watcherConfig: InboxWatcherConfig
  private pendingFiles: Map<string, NodeJS.Timeout> = new Map()
  private messageCache: Map<string, InboxFile> = new Map()

  constructor(config: InboxWatcherConfig = {}) {
    super()
    // Priority: explicit watchPath > teamsPath > default ~/.claude/teams
    const defaultPath = config.watchPath || config.teamsPath
    this.watcherConfig = {
      watchPath: defaultPath || path.join(os.homedir(), '.claude', 'teams'),
      stableThreshold: config.stableThreshold || 200,
      pollInterval: config.pollInterval || 100,
    }
  }

  getConfig(): InboxWatcherConfig {
    return { ...this.watcherConfig }
  }

  setWatchPath(newPath: string): void {
    this.watcherConfig.watchPath = newPath
  }

  async start(): Promise<void> {
    logger.info({ watchPath: this.watcherConfig.watchPath }, 'Starting on path')

    try {
      await fs.access(this.watcherConfig.watchPath!)
    } catch {
      logger.info({ watchPath: this.watcherConfig.watchPath }, 'Path does not exist, creating')
      await fs.mkdir(this.watcherConfig.watchPath!, { recursive: true })
    }

    this.watcher = chokidar.watch(this.watcherConfig.watchPath!, {
      persistent: true,
      ignoreInitial: true,
      usePolling: true,
      interval: 1000,
      awaitWriteFinish: {
        stabilityThreshold: this.watcherConfig.stableThreshold,
        pollInterval: this.watcherConfig.pollInterval,
      },
    })

    this.watcher.on('add', (filepath) => this.handleFileAdd(filepath))
    this.watcher.on('change', (filepath) => this.handleFileChange(filepath))
    this.watcher.on('unlink', (filepath) => this.handleFileRemove(filepath))

    logger.info('Started')
  }

  private async handleFileAdd(filepath: string): Promise<void> {
    if (!this.isInboxFile(filepath)) return

    const inboxFile = await this.parseInboxFile(filepath)
    if (!inboxFile) return

    this.messageCache.set(filepath, inboxFile)
    this.emit('add', inboxFile)
    logger.debug({ filepath }, 'File added')
  }

  private async handleFileChange(filepath: string): Promise<void> {
    if (!this.isInboxFile(filepath)) return

    const inboxFile = await this.parseInboxFile(filepath)
    if (!inboxFile) return

    const previous = this.messageCache.get(filepath)
    this.messageCache.set(filepath, inboxFile)

    if (previous) {
      this.emit('change', { file: inboxFile, previous })
    } else {
      this.emit('add', inboxFile)
    }
  }

  private handleFileRemove(filepath: string): void {
    if (!this.isInboxFile(filepath)) return

    const removed = this.messageCache.get(filepath)
    if (removed) {
      this.messageCache.delete(filepath)
      this.emit('unlink', removed)
      logger.debug({ filepath }, 'File removed')
    }
  }

  private isInboxFile(filepath: string): boolean {
    // Match: ~/.claude/teams/{team-id}/inboxes/{agent-name}.json
    const parts = filepath.split(path.sep)
    const inboxesIndex = parts.indexOf('inboxes')
    return inboxesIndex !== -1 && filepath.endsWith('.json')
  }

  private async parseInboxFile(filepath: string): Promise<InboxFile | null> {
    try {
      const content = await fs.readFile(filepath, 'utf-8')
      const parts = filepath.split(path.sep)
      const inboxesIndex = parts.indexOf('inboxes')
      const teamsIndex = parts.indexOf('teams')

      if (teamsIndex === -1 || inboxesIndex === -1) {
        return null
      }

      const teamId = parts[teamsIndex + 1]
      const recipient = parts[inboxesIndex + 1].replace('.json', '')

      return {
        teamId,
        recipient,
        filepath,
        content,
      }
    } catch (error) {
      logger.error({ error, filepath }, 'Error parsing file')
      return null
    }
  }

  getWatchPath(): string {
    return this.watcherConfig.watchPath!
  }

  async stop(): Promise<void> {
    if (this.watcher) {
      await this.watcher.close()
      this.watcher = null
    }
    this.pendingFiles.forEach((timeout) => clearTimeout(timeout))
    this.pendingFiles.clear()
    logger.info('Stopped')
  }
}
