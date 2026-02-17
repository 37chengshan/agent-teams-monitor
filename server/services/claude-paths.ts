import path from 'path'
import os from 'os'

/**
 * 获取 Claude 配置目录路径
 */
export function getClaudePath(): string {
  return path.join(os.homedir(), '.claude')
}

/**
 * 获取 Teams 目录路径
 */
export function getTeamsPath(): string {
  return path.join(getClaudePath(), 'teams')
}

/**
 * 获取 Tasks 目录路径
 */
export function getTasksPath(): string {
  return path.join(getClaudePath(), 'tasks')
}

/**
 * 获取指定团队的配置文件路径
 */
export function getTeamConfigPath(teamId: string): string {
  return path.join(getTeamsPath(), teamId, 'config.json')
}

/**
 * 获取指定团队的 inbox 目录路径
 */
export function getTeamInboxPath(teamId: string): string {
  return path.join(getTeamsPath(), teamId, 'inboxes')
}

/**
 * 获取指定团队的任务目录路径
 */
export function getTeamTasksPath(teamId: string): string {
  return path.join(getTasksPath(), teamId)
}

/**
 * 检查路径是否存在
 */
export async function pathExists(filepath: string): Promise<boolean> {
  try {
    const fs = await import('fs/promises')
    await fs.access(filepath)
    return true
  } catch {
    return false
  }
}
