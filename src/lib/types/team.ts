/**
 * 团队成员类型
 */
export interface TeamMember {
  name: string
  role?: string
  instructions?: string
  maxIterations?: number
  model?: string
  agentType?: string
}

/**
 * 团队配置类型
 */
export interface Team {
  id: string // 团队唯一标识（从文件名提取）
  name: string // 团队名称
  description?: string // 团队描述
  members: TeamMember[] // 团队成员列表
  memberCount: number // 成员数量
  createdAt: Date // 创建时间
  updatedAt: Date // 更新时间
  filepath: string // 配置文件路径
}

/**
 * 团队配置文件原始格式
 */
export interface TeamConfigFile {
  name?: string
  description?: string
  agent_type?: string
  members: TeamMember[]
  lead_agent_id?: string
}
