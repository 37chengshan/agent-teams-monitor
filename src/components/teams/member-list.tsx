'use client'

/**
 * MemberList - 成员列表组件
 */

import { TeamMember } from '@/lib/types'
import { MotionList } from '@/components/animations/motion-list'
import { MemberCard } from './member-card'

interface MemberListProps {
  members: TeamMember[]
}

export function MemberList({ members }: MemberListProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        暂无成员
      </div>
    )
  }

  return (
    <MotionList className="space-y-3">
      {members.map((member, index) => (
        <MemberCard key={index} member={member} />
      ))}
    </MotionList>
  )
}
