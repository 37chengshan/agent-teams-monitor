/**
 * Agent 状态枚举
 */
export enum AgentStatus {
  IDLE = 'idle',
  WORKING = 'working',
  COMPLETED = 'completed',
  ERROR = 'error',
  OFFLINE = 'offline'
}

/**
 * Agent 状态类型
 */
export interface AgentState {
  name: string // Agent 名称
  status: AgentStatus // 当前状态
  currentTask?: string // 当前正在执行的任务
  lastActivity: Date // 最后活动时间
  teamId?: string // 所属团队 ID
  model?: string // 使用的模型
  agentType?: string // Agent 类型
}

/**
 * Agent 元数据
 */
export interface AgentMetadata {
  name: string
  agentId: string
  agentType: string
  model?: string
  color?: string
}
