/**
 * 任务状态枚举
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  DELETED = 'deleted'
}

/**
 * 任务类型
 */
export interface Task {
  id: string // 任务唯一标识
  subject: string // 任务标题
  description?: string // 任务描述
  status: TaskStatus // 任务状态
  owner?: string // 负责的 agent
  blocks: string[] // 此任务阻塞的其他任务 ID
  blockedBy: string[] // 阻塞此任务的其他任务 ID
  metadata?: Record<string, unknown> // 元数据
  createdAt: Date // 创建时间
  completedAt?: Date // 完成时间
  filepath: string // 任务文件路径
}

/**
 * 任务文件原始格式
 */
export interface TaskFile {
  id: string
  subject: string
  description?: string
  status: TaskStatus
  owner?: string
  blocks?: string[]
  blockedBy?: string[]
  metadata?: Record<string, unknown>
  createdAt?: string
  completedAt?: string
}
