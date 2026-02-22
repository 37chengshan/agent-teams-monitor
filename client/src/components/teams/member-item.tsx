'use client'

import { memo } from 'react'
import { Member, MemberStatus } from '@/types'

interface MemberItemProps {
  member: Member
  showStatus?: boolean
}

const statusColors: Record<MemberStatus, string> = {
  [MemberStatus.ACTIVE]: 'bg-accent-success',
  [MemberStatus.IDLE]: 'bg-accent-warning',
  [MemberStatus.OFFLINE]: 'bg-slate-500',
  [MemberStatus.BUSY]: 'bg-accent-info',
}

const statusLabels: Record<MemberStatus, string> = {
  [MemberStatus.ACTIVE]: '工作中',
  [MemberStatus.IDLE]: '空闲',
  [MemberStatus.OFFLINE]: '离线',
  [MemberStatus.BUSY]: '忙碌',
}

export const MemberItem = memo(function MemberItem({ member, showStatus = true }: MemberItemProps) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-background-tertiary transition-colors">
      <div className="relative">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
          style={{ backgroundColor: member.color || '#8B5CF6' }}
        >
          {member.name.charAt(0).toUpperCase()}
        </div>
        {showStatus && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background-secondary ${
              statusColors[member.status]
            }`}
            title={statusLabels[member.status]}
          />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200 truncate">
            {member.name}
          </span>
          {member.role === 'leader' && (
            <span className="text-xs text-accent-primary">负责人</span>
          )}
        </div>
        {showStatus && (
          <span className="text-xs text-slate-500">{statusLabels[member.status]}</span>
        )}
      </div>
    </div>
  )
})
