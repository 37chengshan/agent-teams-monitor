// Message types
export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  PROTOCOL = 'protocol',
}

export enum ProtocolMessageType {
  IDLE_NOTIFICATION = 'idle_notification',
  SHUTDOWN_REQUEST = 'shutdown_request',
  SHUTDOWN_RESPONSE = 'shutdown_response',
  PLAN_APPROVAL_REQUEST = 'plan_approval_request',
  PLAN_APPROVAL_RESPONSE = 'plan_approval_response',
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  BLOCKED = 'blocked',
}

export enum MemberStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  OFFLINE = 'offline',
  BUSY = 'busy',
}

export interface InboxMessage {
  id: string
  from: string
  to?: string
  text: string
  summary?: string
  timestamp: Date | string
  color?: string
  read: boolean
  type: MessageType
  protocolType?: ProtocolMessageType
  teamId: string
  recipient: string
  filepath?: string
  lineNumber?: string
}

export interface Team {
  id: string
  name: string
  members: Member[]
  createdAt: Date | string
  config?: {
    name: string
    members: string[]
    agentPrompts?: Record<string, string>
  }
}

export interface Member {
  id: string
  name: string
  role: 'leader' | 'member'
  status: MemberStatus
  color: string
  lastSeen?: Date | string
}

export interface Task {
  id: string
  teamId?: string
  subject: string
  description: string
  status: TaskStatus
  owner?: string
  blockedBy: string[]
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Conversation {
  id: string
  teamId: string
  teamName: string
  agentName: string
  agentColor: string
  lastMessage: {
    text: string
    timestamp: Date | string
    type: 'user' | 'assistant' | 'protocol'
  }
  unreadCount: number
  isOnline: boolean
  status: MemberStatus
}

export interface MessageFilters {
  sender?: string[]
  type?: 'all' | 'user' | 'assistant' | 'protocol'
  status?: 'all' | 'read' | 'unread'
  teamId?: string
  dateRange?: {
    start: Date
    end: Date
  } | null
  searchQuery?: string
}
