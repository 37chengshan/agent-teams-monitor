'use client'

/**
 * MemberCard - 成员卡片组件
 */

import { TeamMember } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

interface MemberCardProps {
  member: TeamMember
}

export function MemberCard({ member }: MemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* 头像 */}
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-sm font-medium">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>

          {/* 信息 */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold">{member.name}</h4>
              {member.role && (
                <Badge variant="secondary" className="text-xs">
                  {member.role}
                </Badge>
              )}
              {member.agentType && (
                <Badge variant="outline" className="text-xs">
                  {member.agentType}
                </Badge>
              )}
            </div>

            {member.instructions && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {member.instructions}
              </p>
            )}

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {member.model && (
                <span>模型: {member.model}</span>
              )}
              {member.maxIterations && (
                <>
                  <Separator orientation="vertical" className="h-4" />
                  <span>最大迭代: {member.maxIterations}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
