import {
  InboxMessage,
  MessageType,
  ProtocolMessageType,
  Team,
  TeamConfig,
  Task,
  TaskStatus,
} from '../types/index.js'
import { createLogger } from '../logger.js'

const logger = createLogger('Parser')

export class Parser {
  parseInboxFile(
    teamId: string,
    recipient: string,
    filepath: string,
    content: string
  ): InboxMessage[] {
    try {
      const data = JSON.parse(content)

      // Handle both array and object formats
      const messages = Array.isArray(data) ? data : [data]

      return messages.map((msg: Record<string, unknown>, index: number) => {
        const protocolType = this.detectProtocolType(msg.text as string)

        return {
          id: `${teamId}-${recipient}-${index}-${Date.now()}`,
          from: msg.from as string || recipient,
          to: msg.to as string | undefined,
          text: msg.text as string || '',
          summary: msg.summary as string | undefined,
          timestamp: new Date(msg.timestamp as string || Date.now()),
          color: msg.color as string | undefined,
          read: false,
          type: protocolType ? MessageType.PROTOCOL : MessageType.ASSISTANT,
          protocolType: protocolType || undefined,
          teamId,
          recipient,
          filepath,
          lineNumber: msg.lineNumber as string | undefined,
        }
      })
    } catch (error) {
      logger.error({ error, filepath }, 'Error parsing inbox file')
      return []
    }
  }

  parseTeamConfig(filepath: string, content: string): TeamConfig | null {
    try {
      const data = JSON.parse(content)
      return {
        name: data.name || 'Unnamed Team',
        members: data.members || [],
        agentPrompts: data.agentPrompts || {},
      }
    } catch (error) {
      logger.error({ error, filepath }, 'Error parsing team config')
      return null
    }
  }

  parseTaskFile(filepath: string, content: string): Task[] {
    try {
      const data = JSON.parse(content)
      const tasks = Array.isArray(data) ? data : [data]

      return tasks.map((task: Record<string, unknown>) => ({
        id: task.id as string || filepath,
        subject: task.subject as string || 'Untitled Task',
        description: task.description as string || '',
        status: (task.status as TaskStatus) || TaskStatus.PENDING,
        owner: task.owner as string | undefined,
        blockedBy: (task.blockedBy as string[]) || [],
        createdAt: new Date(task.createdAt as string || Date.now()),
        updatedAt: new Date(task.updatedAt as string || Date.now()),
      }))
    } catch (error) {
      logger.error({ error, filepath }, 'Error parsing task file')
      return []
    }
  }

  private static readonly PROTOCOL_PATTERNS: Array<{ keywords: string[], type: ProtocolMessageType }> = [
    { keywords: ['shutdown_request', 'shutdown request'], type: ProtocolMessageType.SHUTDOWN_REQUEST },
    { keywords: ['shutdown_response', 'shutdown response'], type: ProtocolMessageType.SHUTDOWN_RESPONSE },
    { keywords: ['plan_approval_request', 'plan approval request'], type: ProtocolMessageType.PLAN_APPROVAL_REQUEST },
    { keywords: ['plan_approval_response', 'plan approval response'], type: ProtocolMessageType.PLAN_APPROVAL_RESPONSE },
    { keywords: ['idle_notification', 'idle notification'], type: ProtocolMessageType.IDLE_NOTIFICATION },
  ]

  detectProtocolType(text: string): ProtocolMessageType | null {
    if (!text) return null

    const lowerText = text.toLowerCase()

    for (const { keywords, type } of Parser.PROTOCOL_PATTERNS) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return type
      }
    }

    return null
  }
}
