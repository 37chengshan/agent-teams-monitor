import { SocketServer } from './socket/server.js'
import { InboxWatcher } from './watchers/inbox-watcher.js'
import { FileOperations } from './services/file-operations.js'
import { Parser } from './services/parser.js'
import { config } from './config.js'
import { logger } from './logger.js'
import type { ServerConfig } from './types/index.js'

export class App {
  private socketServer: SocketServer
  private inboxWatcher: InboxWatcher
  private fileOps: FileOperations
  private parser: Parser

  constructor() {
    const serverConfig: ServerConfig = {
      port: config.serverPort,
      cors: {
        origin: config.corsOrigin,
        credentials: true,
      },
    }

    this.socketServer = new SocketServer(serverConfig)
    this.inboxWatcher = new InboxWatcher({ watchPath: config.teamsPath })
    this.fileOps = new FileOperations()
    this.parser = new Parser()

    this.setupEventHandlers()
  }

  private setupEventHandlers(): void {
    // Forward inbox watcher events to clients
    this.inboxWatcher.on('add', (inboxFile) => {
      const messages = this.parser.parseInboxFile(
        inboxFile.teamId,
        inboxFile.recipient,
        inboxFile.filepath,
        inboxFile.content
      )

      messages.forEach((message) => {
        this.socketServer.broadcastToRoom(
          `team:${inboxFile.teamId}`,
          'inbox:message',
          message
        )
      })
    })

    this.inboxWatcher.on('change', ({ file }) => {
      const messages = this.parser.parseInboxFile(
        file.teamId,
        file.recipient,
        file.filepath,
        file.content
      )

      messages.forEach((message) => {
        this.socketServer.broadcastToRoom(
          `team:${file.teamId}`,
          'inbox:message:update',
          message
        )
      })
    })

    this.inboxWatcher.on('unlink', (file) => {
      this.socketServer.broadcastToRoom(
        `team:${file.teamId}`,
        'inbox:message:delete',
        { teamId: file.teamId, recipient: file.recipient }
      )
    })

    // Handle socket events
    this.socketServer.on('inbox:init', async ({ socket, teamId }) => {
      const messages = await this.fileOps.loadInitialMessages(teamId)
      socket.emit('inbox:initial', { messages, teamId })
    })

    this.socketServer.on('team:init', async ({ socket }) => {
      const teams = await this.fileOps.discoverTeams()
      logger.debug({ teams: teams.map(t => t.id) }, 'discoverTeams returned')
      socket.emit('teams:initial', { teams })
    })

    this.socketServer.on('tasks:init', async ({ socket, teamId }) => {
      const tasks = await this.fileOps.loadTasks(teamId)
      socket.emit('tasks:initial', { tasks, teamId })
    })

    this.socketServer.on('inbox:read', ({ socket, messageId }) => {
      socket.emit('inbox:message:read', { messageId })
    })

    // Team CRUD events
    this.socketServer.on('team:create', async ({ socket, teamId, name, members, agentPrompts }) => {
      try {
        await this.fileOps.createTeam(teamId, name, members, agentPrompts)
        const teams = await this.fileOps.discoverTeams()
        this.socketServer.broadcast('teams:initial', { teams })
        socket.emit('team:created', { teamId, success: true })
      } catch (error) {
        logger.error({ error, teamId }, 'Error creating team')
        socket.emit('team:created', { teamId, success: false, error: String(error) })
      }
    })

    this.socketServer.on('team:update', async ({ socket, teamId, name, members, agentPrompts }) => {
      try {
        await this.fileOps.updateTeam(teamId, name, members, agentPrompts)
        const teams = await this.fileOps.discoverTeams()
        this.socketServer.broadcast('teams:initial', { teams })
        socket.emit('team:updated', { teamId, success: true })
      } catch (error) {
        logger.error({ error, teamId }, 'Error updating team')
        socket.emit('team:updated', { teamId, success: false, error: String(error) })
      }
    })

    this.socketServer.on('team:delete', async ({ socket, teamId }) => {
      try {
        await this.fileOps.deleteTeam(teamId)
        const teams = await this.fileOps.discoverTeams()
        this.socketServer.broadcast('teams:initial', { teams })
        socket.emit('team:deleted', { teamId, success: true })
      } catch (error) {
        logger.error({ error, teamId }, 'Error deleting team')
        socket.emit('team:deleted', { teamId, success: false, error: String(error) })
      }
    })
  }

  async start(): Promise<void> {
    logger.info('Starting Agent Teams Monitor')
    logger.info({ teamsPath: config.teamsPath }, 'Using teams path')
    logger.info({ port: config.serverPort }, 'Server port')

    await this.inboxWatcher.start()
    await this.socketServer.start()

    logger.info('Agent Teams Monitor started')
  }

  async stop(): Promise<void> {
    logger.info('Stopping Agent Teams Monitor')

    await this.socketServer.stop()
    await this.inboxWatcher.stop()

    logger.info('Agent Teams Monitor stopped')
  }
}
