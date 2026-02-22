'use client'

import { memo } from 'react'
import { Member } from '@/types'
import { MemberItem } from './member-item'

interface MemberListProps {
  members: Member[]
  showStatus?: boolean
}

export const MemberList = memo(function MemberList({ members, showStatus = true }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="flex items-center justify-center p-4 text-slate-400">
        <p className="text-sm">暂无成员</p>
      </div>
    )
  }

  return (
    <div className="space-y-1">
      {members.map((member) => (
        <MemberItem
          key={member.id}
          member={member}
          showStatus={showStatus}
        />
      ))}
    </div>
  )
})
