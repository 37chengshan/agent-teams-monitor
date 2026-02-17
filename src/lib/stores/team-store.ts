/**
 * Team Store - 团队数据状态管��
 */

import { create } from 'zustand'
import type { Team } from '@/lib/types/team'

interface TeamStore {
  // 状态
  teams: Team[]
  loading: boolean
  error: string | null

  // Actions
  setTeams: (teams: Team[]) => void
  addTeam: (team: Team) => void
  updateTeam: (team: Team) => void
  deleteTeam: (teamId: string) => void
  removeTeam: (teamId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useTeamStore = create<TeamStore>((set) => ({
  // 初始状态
  teams: [],
  loading: false,
  error: null,

  // 设置所有团队
  setTeams: (teams) => set({ teams }),

  // 添加新团队 (不可变更新)
  addTeam: (team) =>
    set((state) => ({
      teams: [...state.teams, team],
    })),

  // 更新团队 (不可变更新)
  updateTeam: (team) =>
    set((state) => ({
      teams: state.teams.map((t) => (t.id === team.id ? team : t)),
    })),

  // 删除团队 (不可变更新)
  removeTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== teamId),
    })),

  // 删除团队 (别名)
  deleteTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== teamId),
    })),

  // 设置加载状态
  setLoading: (loading) => set({ loading }),

  // 设置错误状态
  setError: (error) => set({ error }),
}))
