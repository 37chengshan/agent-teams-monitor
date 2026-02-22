import * as os from 'os'
import * as path from 'path'

export interface AppConfig {
  teamsPath: string
  serverPort: number
  corsOrigin: string | string[]
}

function getEnvOrDefault(envVar: string | undefined, defaultValue: string): string {
  return envVar || defaultValue
}

function getTeamsPath(): string {
  // Priority: CLAUDE_TEAMS_PATH > DATA_DIR > ~/.claude/teams
  const claudeTeamsPath = process.env.CLAUDE_TEAMS_PATH
  if (claudeTeamsPath) {
    return claudeTeamsPath
  }

  const dataDir = process.env.DATA_DIR
  if (dataDir) {
    return path.join(dataDir, 'teams')
  }

  return path.join(os.homedir(), '.claude', 'teams')
}

function getServerPort(): number {
  const port = process.env.PORT || process.env.SERVER_PORT
  return port ? parseInt(port, 10) : 3002
}

function getCorsOrigin(): string | string[] {
  const origin = process.env.CORS_ORIGIN
  if (!origin) {
    return '*'
  }
  // Support comma-separated list of origins
  return origin.split(',').map((o) => o.trim())
}

export const config: AppConfig = {
  teamsPath: getTeamsPath(),
  serverPort: getServerPort(),
  corsOrigin: getCorsOrigin(),
}

export function getConfig(): AppConfig {
  return config
}

export function setTeamsPath(newPath: string): void {
  config.teamsPath = newPath
}
