import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types/api'
import type { Team } from '@/lib/types'
import { fileWatcherManager } from '../../../../server/watchers'

/**
 * GET /api/teams
 * 获取所有团队列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('id')

    // 如果指定了 teamId，返回单个团队
    if (teamId) {
      const teams = fileWatcherManager.getAllTeams()
      const team = teams.find((t: Team) => t.id === teamId)

      if (!team) {
        const response: ApiResponse<Team> = {
          success: false,
          error: `Team with id "${teamId}" not found`
        }
        return NextResponse.json(response, { status: 404 })
      }

      const response: ApiResponse<Team> = {
        success: true,
        data: team
      }
      return NextResponse.json(response)
    }

    // 返回所有团队
    const teams = fileWatcherManager.getAllTeams()

    // 支持搜索过滤
    const search = searchParams.get('search')
    let filteredTeams = teams
    if (search) {
      const searchLower = search.toLowerCase()
      filteredTeams = teams.filter((team: Team) =>
        team.name.toLowerCase().includes(searchLower) ||
        team.description?.toLowerCase().includes(searchLower)
      )
    }

    const response: ApiResponse<Team[]> = {
      success: true,
      data: filteredTeams,
      meta: {
        total: filteredTeams.length,
        page: 1,
        limit: filteredTeams.length
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/teams:', error)

    const response: ApiResponse<Team[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return NextResponse.json(response, { status: 500 })
  }
}
