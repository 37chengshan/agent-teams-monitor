import { Server as SocketIOServer, Socket } from 'socket.io'
import { Server as HTTPServer, createServer } from 'http'
import { EventEmitter } from 'events'
import type { ServerConfig, ClientInfo } from '../types/index.js'
import { createLogger } from '../logger.js'

const logger = createLogger('SocketServer')

export class SocketServer extends EventEmitter {
  private io: SocketIOServer | null = null
  private httpServer: HTTPServer | null = null
  private config: ServerConfig
  private clients: Map<string, ClientInfo> = new Map()

  constructor(config: ServerConfig) {
    super()
    this.config = config
  }

  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.httpServer = createServer()
      this.io = new SocketIOServer(this.httpServer, {
        cors: this.config.cors,
        path: '/socket.io',
      })

      this.setupEventHandlers()

      this.httpServer.listen(this.config.port, () => {
        this.emit('server:started', { port: this.config.port })
        logger.info({ port: this.config.port }, 'Started')
        resolve()
      })

      this.httpServer.on('error', (error) => {
        this.emit('server:error', error)
        reject(error)
      })
    })
  }

  private setupEventHandlers(): void {
    if (!this.io) return

    this.io.on('connection', (socket: Socket) => {
      logger.info({ clientId: socket.id }, 'Client connected')

      const clientInfo: ClientInfo = {
        id: socket.id,
        rooms: [],
        connectedAt: new Date(),
      }
      this.clients.set(socket.id, clientInfo)

      this.handleSocketEvents(socket)
      this.emit('client:connected', { clientId: socket.id })

      socket.on('disconnect', () => {
        this.clients.delete(socket.id)
        this.emit('client:disconnected', { clientId: socket.id })
        logger.info({ clientId: socket.id }, 'Client disconnected')
      })
    })
  }

  private handleSocketEvents(socket: Socket): void {
    socket.on('team:join', (data) => this.handleTeamJoin(socket, data))
    socket.on('team:leave', (data) => this.handleTeamLeave(socket, data))
    socket.on('team:init', (data) => this.handleTeamInit(socket, data))
    socket.on('team:create', (data) => this.handleTeamCreate(socket, data))
    socket.on('team:update', (data) => this.handleTeamUpdate(socket, data))
    socket.on('team:delete', (data) => this.handleTeamDelete(socket, data))
    socket.on('inbox:init', (data) => this.handleInboxInit(socket, data))
    socket.on('inbox:read', (data) => this.handleInboxRead(socket, data))
    socket.on('tasks:init', (data) => this.handleTasksInit(socket, data))
  }

  private handleTeamJoin(socket: Socket, data: { teamId: string }): void {
    socket.join(`team:${data.teamId}`)
    const client = this.clients.get(socket.id)
    if (client) {
      client.rooms.push(data.teamId)
    }
    logger.debug({ clientId: socket.id, teamId: data.teamId }, 'Client joined team')
  }

  private handleTeamLeave(socket: Socket, data: { teamId: string }): void {
    socket.leave(`team:${data.teamId}`)
    const client = this.clients.get(socket.id)
    if (client) {
      client.rooms = client.rooms.filter((r) => r !== data.teamId)
    }
  }

  private handleTeamInit(socket: Socket, _data: unknown): void {
    // Emit initial team data - will be connected to FileWatcherManager
    this.emit('team:init', { socket })
  }

  private handleTeamCreate(socket: Socket, data: { teamId: string; name: string; members: string[]; agentPrompts?: Record<string, string> }): void {
    this.emit('team:create', { socket, teamId: data.teamId, name: data.name, members: data.members, agentPrompts: data.agentPrompts })
  }

  private handleTeamUpdate(socket: Socket, data: { teamId: string; name: string; members: string[]; agentPrompts?: Record<string, string> }): void {
    this.emit('team:update', { socket, teamId: data.teamId, name: data.name, members: data.members, agentPrompts: data.agentPrompts })
  }

  private handleTeamDelete(socket: Socket, data: { teamId: string }): void {
    this.emit('team:delete', { socket, teamId: data.teamId })
  }

  private handleInboxInit(socket: Socket, data: { teamId: string }): void {
    // Emit initial inbox data - will be connected to FileWatcherManager
    this.emit('inbox:init', { socket, teamId: data.teamId })
  }

  private handleInboxRead(socket: Socket, data: { messageId: string }): void {
    this.emit('inbox:read', { socket, messageId: data.messageId })
  }

  private handleTasksInit(socket: Socket, data: { teamId: string }): void {
    this.emit('tasks:init', { socket, teamId: data.teamId })
  }

  broadcast(event: string, data: unknown): void {
    this.io?.emit(event, data)
  }

  broadcastToRoom(room: string, event: string, data: unknown): void {
    this.io?.to(room).emit(event, data)
  }

  getConnectedClients(): ClientInfo[] {
    return Array.from(this.clients.values())
  }

  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.io) {
        this.io.close()
      }
      if (this.httpServer) {
        this.httpServer.close(() => {
          this.emit('server:stopped')
          logger.info('Stopped')
          resolve()
        })
      } else {
        resolve()
      }
    })
  }
}
