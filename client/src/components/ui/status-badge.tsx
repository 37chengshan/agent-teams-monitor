'use client'

import { memo } from 'react'
import { MemberStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: MemberStatus
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const statusConfig: Record<MemberStatus, { color: string; label: string }> = {
  [MemberStatus.ACTIVE]: { color: 'bg-accent-success', label: '活跃' },
  [MemberStatus.IDLE]: { color: 'bg-accent-warning', label: '空闲' },
  [MemberStatus.OFFLINE]: { color: 'bg-slate-500', label: '离线' },
  [MemberStatus.BUSY]: { color: 'bg-accent-info', label: '忙碌' },
}

const sizeConfig = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
}

export const StatusBadge = memo(function StatusBadge({ status, showLabel = false, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-1.5">
      <span
        className={cn(
          'rounded-full',
          config.color,
          sizeConfig[size],
          status === MemberStatus.ACTIVE && 'animate-pulse'
        )}
      />
      {showLabel && (
        <span className="text-xs text-slate-400">{config.label}</span>
      )}
    </div>
  )
})
