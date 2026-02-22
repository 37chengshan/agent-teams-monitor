import { EventEmitter } from 'events'
import { InboxWatcher, type InboxWatcherConfig, type InboxFile } from './inbox-watcher.js'
import { createLogger } from '../logger.js'

const logger = createLogger('FileWatcherManager')

export interface WatcherConfig {
  inbox?: InboxWatcherConfig
  teamsPath?: string
  tasksPath?: string
}

export interface FileWatcherManagerConfig {
  watchPath?: string
  inbox?: InboxWatcherConfig
}

/**
 * FileWatcherManager coordinates all file watchers (Inbox, Team, Task)
 */
export class FileWatcherManager extends EventEmitter {
  private inboxWatcher: InboxWatcher | undefined = undefined
  private config: FileWatcherManagerConfig

  constructor(config: FileWatcherManagerConfig = {}) {
    super()
    this.config = {
      watchPath: config.watchPath || '~/.claude/teams',
      inbox: config.inbox,
    }
  }

  /**
   * Add an inbox watcher
   */
  addInboxWatcher(config?: InboxWatcherConfig): InboxWatcher {
    const watcherConfig = config || this.config.inbox || {
      watchPath: this.config.watchPath,
    }
    this.inboxWatcher = new InboxWatcher(watcherConfig)

    // Forward events
    this.inboxWatcher.on('add', (file: InboxFile) => {
      this.emit('inbox:add', file)
    })

    this.inboxWatcher.on('change', (data: { file: InboxFile; previous: InboxFile }) => {
      this.emit('inbox:change', data)
    })

    this.inboxWatcher.on('unlink', (file: InboxFile) => {
      this.emit('inbox:unlink', file)
    })

    return this.inboxWatcher
  }

  /**
   * Get inbox watcher
   */
  getInboxWatcher(): InboxWatcher | undefined {
    return this.inboxWatcher
  }

  /**
   * Start all watchers
   */
  async start(): Promise<void> {
    logger.info('Starting')

    if (this.inboxWatcher) {
      await this.inboxWatcher.start()
    }

    logger.info('Started')
  }

  /**
   * Stop all watchers
   */
  async stop(): Promise<void> {
    logger.info('Stopping')

    if (this.inboxWatcher) {
      await this.inboxWatcher.stop()
    }

    logger.info('Stopped')
  }
}
