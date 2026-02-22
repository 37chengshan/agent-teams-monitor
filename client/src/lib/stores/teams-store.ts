'use client'

import { create } from 'zustand'
import { Team, Member, MemberStatus } from '@/types'

interface TeamsState {
  teams: Team[]
  activeTeamId: string | null
  members: Map<string, Member[]>
  isLoading: boolean
  error: string | null
}

interface TeamsActions {
  setTeams: (teams: Team[]) => void
  setActiveTeam: (teamId: string | null) => void
  updateTeam: (teamId: string, updates: Partial<Team>) => void
  addTeam: (team: Team) => void
  removeTeam: (teamId: string) => void
  setMembers: (teamId: string, members: Member[]) => void
  updateMemberStatus: (teamId: string, memberId: string, status: MemberStatus) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useTeamsStore = create<TeamsState & TeamsActions>((set) => ({
  teams: [],
  activeTeamId: null,
  members: new Map(),
  isLoading: false,
  error: null,

  setTeams: (teams) =>
    set((state) => {
      // Populate members Map from teams data
      const newMembers = new Map(state.members)
      teams.forEach((team) => {
        if (team.members) {
          newMembers.set(team.id, team.members)
        }
      })
      return { teams, members: newMembers }
    }),

  setActiveTeam: (teamId) => set({ activeTeamId: teamId }),

  updateTeam: (teamId, updates) =>
    set((state) => ({
      teams: state.teams.map((t) =>
        t.id === teamId ? { ...t, ...updates } : t
      ),
    })),

  addTeam: (team) =>
    set((state) => ({
      teams: [...state.teams, team],
    })),

  removeTeam: (teamId) =>
    set((state) => ({
      teams: state.teams.filter((t) => t.id !== teamId),
    })),

  setMembers: (teamId, members) =>
    set((state) => {
      const newMembers = new Map(state.members)
      newMembers.set(teamId, members)
      return { members: newMembers }
    }),

  updateMemberStatus: (teamId, memberId, status) =>
    set((state) => {
      const newMembers = new Map(state.members)
      const teamMembers = newMembers.get(teamId) || []
      const updatedMembers = teamMembers.map((m) =>
        m.id === memberId ? { ...m, status } : m
      )
      newMembers.set(teamId, updatedMembers)
      return { members: newMembers }
    }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
