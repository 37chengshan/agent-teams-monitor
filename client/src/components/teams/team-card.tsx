'use client'

import { memo } from 'react'
import { Users, Clock } from 'lucide-react'
import { Team } from '@/types'

interface TeamCardProps {
  team: Team
  isActive: boolean
  onClick: () => void
}

export const TeamCard = memo(function TeamCard({ team, isActive, onClick }: TeamCardProps) {
  const memberCount = team.members?.length || 0

  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
        isActive
          ? 'bg-background-secondary border-accent-primary shadow-lg'
          : 'bg-background-secondary border-slate-700 hover:border-slate-600'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-slate-100">{team.name}</h3>
        {isActive && (
          <span className="flex items-center gap-1 text-xs text-accent-success">
            <span className="w-2 h-2 bg-accent-success rounded-full animate-pulse" />
            活跃
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm text-slate-400">
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{memberCount} 名成员</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>
            {team.createdAt
              ? new Date(team.createdAt).toLocaleDateString('zh-CN')
              : '最近'}
          </span>
        </div>
      </div>
    </button>
  )
})
