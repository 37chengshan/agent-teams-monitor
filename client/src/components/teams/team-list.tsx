'use client'

import { memo } from 'react'
import { Team } from '@/types'
import { TeamCard } from './team-card'

interface TeamListProps {
  teams: Team[]
  activeTeamId: string | null
  onSelectTeam: (teamId: string) => void
}

export const TeamList = memo(function TeamList({ teams, activeTeamId, onSelectTeam }: TeamListProps) {
  if (teams.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400">
        <p>暂无团队</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {teams.map((team) => (
        <TeamCard
          key={team.id}
          team={team}
          isActive={team.id === activeTeamId}
          onClick={() => onSelectTeam(team.id)}
        />
      ))}
    </div>
  )
})
