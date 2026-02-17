import path from 'path'
import { statSync } from 'fs'
import type { Team, Task, InboxMessage, TeamConfigFile, TaskFile, InboxFile } from '@/lib/types'
import { MessageType, ProtocolMessageType } from '@/lib/types'

/**
 * 解析团队配置文件
 */
export function parseTeamFile(
  teamId: string,
  filepath: string,
  data: TeamConfigFile
): Team {
  const stats = statSync(filepath)

  return {
    id: teamId,
    name: data.name || teamId,
    description: data.description,
    members: data.members || [],
    memberCount: data.members?.length || 0,
    createdAt: stats.birthtime,
    updatedAt: stats.mtime,
    filepath
  }
}

/**
 * 解析任务文件
 */
export function parseTaskFile(taskId: string, filepath: string, data: TaskFile): Task {
  const stats = statSync(filepath)

  return {
    id: data.id || taskId,
    subject: data.subject,
    description: data.description,
    status: data.status,
    owner: data.owner,
    blocks: data.blocks || [],
    blockedBy: data.blockedBy || [],
    metadata: data.metadata,
    createdAt: data.createdAt ? new Date(data.createdAt) : stats.birthtime,
    completedAt:
      data.status === 'completed' && data.completedAt
        ? new Date(data.completedAt)
        : undefined,
    filepath
  }
}

/**
 * 解析 inbox 消息文件
 */
export function parseInboxFile(
  teamId: string,
  recipient: string,
  _filepath: string,
  messages: InboxFile[]
): InboxMessage[] {
  return messages.map((msg, index) => {
    // 尝试解析协议消息
    let protocolType: ProtocolMessageType | undefined
    let messageType: MessageType = MessageType.ASSISTANT

    try {
      const parsed = JSON.parse(msg.text)
      if (parsed.type) {
        protocolType = parsed.type
        messageType = MessageType.SYSTEM
      }
    } catch {
      // 不是 JSON 格式，作为普通消息处理
    }

    return {
      id: `${teamId}-${recipient}-${index}`,
      from: msg.from,
      to: msg.to,
      text: msg.text,
      summary: msg.summary,
      timestamp: new Date(msg.timestamp),
      color: msg.color,
      read: msg.read,
      type: messageType,
      protocolType,
      teamId,
      recipient
    }
  })
}

/**
 * 从文件路径提取团队 ID
 */
export function extractTeamIdFromPath(filepath: string, teamsBasePath: string): string {
  const relativePath = path.relative(teamsBasePath, filepath)
  const parts = relativePath.split(path.sep)
  return parts[0] || ''
}

/**
 * 从文件路径提取任务 ID
 */
export function extractTaskIdFromPath(filepath: string): string {
  const basename = path.basename(filepath, '.json')
  return basename
}

/**
 * 从文件路径提取收件人名称（inbox 文件）
 */
export function extractRecipientFromPath(filepath: string): string {
  const basename = path.basename(filepath, '.json')
  return basename
}

/**
 * 验证团队数据
 */
export function validateTeamData(data: unknown): data is TeamConfigFile {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const teamData = data as Record<string, unknown>

  if (!Array.isArray(teamData.members)) {
    return false
  }

  return true
}

/**
 * 验证任务数据
 */
export function validateTaskData(data: unknown): data is TaskFile {
  if (typeof data !== 'object' || data === null) {
    return false
  }

  const taskData = data as Record<string, unknown>

  if (typeof taskData.subject !== 'string') {
    return false
  }

  if (
    taskData.status &&
    !['pending', 'in_progress', 'completed', 'failed', 'cancelled', 'deleted'].includes(
      taskData.status as string
    )
  ) {
    return false
  }

  return true
}
