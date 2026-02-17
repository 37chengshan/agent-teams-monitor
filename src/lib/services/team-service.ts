/**
 * Team Service - 团队 API 服务
 */

import type { ApiResponse, Team } from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const teamService = {
  /**
   * 获取所有团队
   */
  async getAll(): Promise<Team[]> {
    const response = await fetch(`${API_BASE_URL}/teams`)
    const data: ApiResponse<Team[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch teams')
    }

    return data.data
  },

  /**
   * 根据 ID 获取团队
   */
  async getById(id: string): Promise<Team> {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`)
    const data: ApiResponse<Team> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch team')
    }

    return data.data
  },

  /**
   * 创建团队
   */
  async create(teamData: Partial<Team>): Promise<Team> {
    const response = await fetch(`${API_BASE_URL}/teams`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    })

    const data: ApiResponse<Team> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to create team')
    }

    return data.data
  },

  /**
   * 更新团队
   */
  async update(id: string, teamData: Partial<Team>): Promise<Team> {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamData),
    })

    const data: ApiResponse<Team> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update team')
    }

    return data.data
  },

  /**
   * 删除团队
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
      method: 'DELETE',
    })

    const data: ApiResponse<void> = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete team')
    }
  },
}
