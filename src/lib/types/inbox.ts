/**
 * 消息类型枚举
 */
export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system'
}

/**
 * 协议消息类型
 */
export enum ProtocolMessageType {
  IDLE_NOTIFICATION = 'idle_notification',
  SHUTDOWN_REQUEST = 'shutdown_request',
  SHUTDOWN_RESPONSE = 'shutdown_response',
  PLAN_APPROVAL_REQUEST = 'plan_approval_request',
  PLAN_APPROVAL_RESPONSE = 'plan_approval_response'
}

/**
 * Inbox 消息类型
 */
export interface InboxMessage {
  id: string // 消息唯一标识（基于时间戳和发送者）
  from: string // 发送者名称
  to?: string // 接收者名称（可选）
  text: string // 消息内容（可能是 JSON 字符串的协议消息）
  summary?: string // 消息摘要
  timestamp: Date // 发送时间
  color?: string // 发送者颜色标识
  read: boolean // 是否已读
  type: MessageType // 消息类型
  protocolType?: ProtocolMessageType // 协议消息类型（如果是协议消息）
  teamId: string // 所属团队 ID
  recipient: string // 接收者名称
}

/**
 * Inbox 文件原始格式
 */
export interface InboxFile {
  from: string
  to?: string
  text: string
  summary?: string
  timestamp: string
  color?: string
  read: boolean
}
