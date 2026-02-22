import * as fs from 'fs/promises'
import * as path from 'path'
import { Parser } from './parser.js'
import { config } from '../config.js'
import { logger } from '../logger.js'
import type { InboxMessage, Team, Task, TeamConfig } from '../types/index.js'
import { MemberStatus } from '../types/index.js'

export class FileOperations {
  private parser: Parser

  constructor() {
    this.parser = new Parser()
  }

  async pathExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  }

  async readJsonFiles(dirPath: string): Promise<Array<{ filepath: string, content: string, filename: string }>> {
    const results: Array<{ filepath: string, content: string, filename: string }> = []

    try {
      const files = await fs.readdir(dirPath)

      for (const file of files) {
        if (!file.endsWith('.json')) continue

        const filepath = path.join(dirPath, file)
        const content = await fs.readFile(filepath, 'utf-8')
        results.push({ filepath, content, filename: file })
      }
    } catch {
      // Directory doesn't exist or is not readable - return empty
    }

    return results
  }

  async loadInitialMessages(teamId?: string): Promise<InboxMessage[]> {
    const messages: InboxMessage[] = []
    const teamsPath = config.teamsPath

    if (!await this.pathExists(teamsPath)) {
      logger.warn({ teamsPath }, 'Teams path does not exist')
      return messages
    }

    try {
      const teamDirs = await fs.readdir(teamsPath)

      for (const teamDir of teamDirs) {
        if (teamId && teamDir !== teamId) continue

        const inboxesPath = path.join(teamsPath, teamDir, 'inboxes')
        const files = await this.readJsonFiles(inboxesPath)

        for (const { filepath, content, filename } of files) {
          const recipient = filename.replace('.json', '')
          const parsed = this.parser.parseInboxFile(teamDir, recipient, filepath, content)
          messages.push(...parsed)
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error loading initial messages')
    }

    return messages
  }

  async discoverTeams(): Promise<Team[]> {
    const teams: Team[] = []
    const teamsPath = config.teamsPath

    if (!await this.pathExists(teamsPath)) {
      logger.warn({ teamsPath }, 'Teams path does not exist')
      return teams
    }

    try {
      const teamDirs = await fs.readdir(teamsPath)

      for (const teamDir of teamDirs) {
        const teamConfigPath = path.join(teamsPath, teamDir, 'config.json')

        try {
          const content = await fs.readFile(teamConfigPath, 'utf-8')
          const teamConfig = this.parser.parseTeamConfig(teamConfigPath, content)

          if (teamConfig) {
            teams.push(this.buildTeam(teamDir, teamConfig))
          }
        } catch {
          // If no config.json, create basic team entry
          teams.push(this.buildBasicTeam(teamDir))
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error discovering teams')
    }

    return teams
  }

  async loadTasks(teamId?: string): Promise<Task[]> {
    const tasks: Task[] = []
    const teamsPath = config.teamsPath

    if (!await this.pathExists(teamsPath)) {
      return tasks
    }

    try {
      const teamDirs = await fs.readdir(teamsPath)

      for (const teamDir of teamDirs) {
        if (teamId && teamDir !== teamId) continue

        const tasksPath = path.join(teamsPath, teamDir, 'tasks')
        const files = await this.readJsonFiles(tasksPath)

        for (const { filepath, content } of files) {
          const parsed = this.parser.parseTaskFile(filepath, content)
          tasks.push(...parsed)
        }
      }
    } catch (error) {
      logger.error({ error }, 'Error loading tasks')
    }

    return tasks
  }

  async createTeam(teamId: string, name: string, members: string[], agentPrompts?: Record<string, string>): Promise<void> {
    const teamsPath = config.teamsPath
    const teamPath = path.join(teamsPath, teamId)

    // Check if team already exists
    if (await this.pathExists(teamPath)) {
      throw new Error(`Team ${teamId} already exists`)
    }

    // Create team directory
    await fs.mkdir(teamPath, { recursive: true })
    await fs.mkdir(path.join(teamPath, 'inboxes'), { recursive: true })
    await fs.mkdir(path.join(teamPath, 'tasks'), { recursive: true })

    // Create config.json
    const teamConfig = {
      name,
      members,
      agentPrompts: agentPrompts || {},
    }
    await fs.writeFile(
      path.join(teamPath, 'config.json'),
      JSON.stringify(teamConfig, null, 2)
    )

    logger.info({ teamId }, 'Created team')
  }

  async updateTeam(teamId: string, name: string, members: string[], agentPrompts?: Record<string, string>): Promise<void> {
    const teamsPath = config.teamsPath
    const teamPath = path.join(teamsPath, teamId)

    // Check if team exists
    if (!await this.pathExists(teamPath)) {
      throw new Error(`Team ${teamId} does not exist`)
    }

    // Read existing config to preserve agentPrompts if not provided
    let existingPrompts: Record<string, string> = {}
    try {
      const existingConfig = await fs.readFile(path.join(teamPath, 'config.json'), 'utf-8')
      const parsed = JSON.parse(existingConfig)
      existingPrompts = parsed.agentPrompts || {}
    } catch {
      // No existing config
    }

    // Update config.json
    const teamConfig = {
      name,
      members,
      agentPrompts: agentPrompts || existingPrompts,
    }
    await fs.writeFile(
      path.join(teamPath, 'config.json'),
      JSON.stringify(teamConfig, null, 2)
    )

    logger.info({ teamId }, 'Updated team')
  }

  async deleteTeam(teamId: string): Promise<void> {
    const teamsPath = config.teamsPath
    const teamPath = path.join(teamsPath, teamId)

    // Check if team exists
    if (!await this.pathExists(teamPath)) {
      throw new Error(`Team ${teamId} does not exist`)
    }

    // Delete team directory
    await fs.rm(teamPath, { recursive: true, force: true })

    logger.info({ teamId }, 'Deleted team')
  }

  private buildTeam(teamDir: string, teamConfig: TeamConfig): Team {
    return {
      id: teamDir,
      name: teamConfig.name,
      members: teamConfig.members.map((memberName: string, index: number) => ({
        id: `${teamDir}-${memberName}`,
        name: memberName,
        role: index === 0 ? 'leader' : 'member',
        status: MemberStatus.OFFLINE,
        color: this.getMemberColor(index),
      })),
      config: teamConfig,
      createdAt: new Date(),
    }
  }

  private buildBasicTeam(teamDir: string): Team {
    return {
      id: teamDir,
      name: teamDir,
      members: [],
      config: { name: teamDir, members: [] },
      createdAt: new Date(),
    }
  }

  private getMemberColor(index: number): string {
    const colors = [
      '#3B82F6', // Blue
      '#22C55E', // Green
      '#8B5CF6', // Purple
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
    ]
    return colors[index % colors.length]
  }
}
