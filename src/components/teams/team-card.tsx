'use client'

/**
 * TeamCard - 团队卡片组件
 */

import { Team } from '@/lib/types'
import { AnimatedCard } from '@/components/animations/animated-card'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Users, Clock } from 'lucide-react'

interface TeamCardProps {
  team: Team
}

export function TeamCard({ team }: TeamCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AnimatedCard>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{team.name}</CardTitle>
            {team.description && (
              <CardDescription className="mt-2 line-clamp-2">
                {team.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 成员统计 */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{team.memberCount} 个成员</span>
          </div>
        </div>

        {/* 成员头像列表 */}
        <div className="flex items-center -space-x-2">
          {team.members.slice(0, 4).map((member, index) => (
            <Avatar key={index} className="h-8 w-8 border-2 border-background">
              <AvatarFallback className="text-xs">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
          ))}
          {team.members.length > 4 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted border-2 border-background text-xs text-muted-foreground">
              +{team.members.length - 4}
            </div>
          )}
        </div>

        {/* 更新时间 */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>更新于 {formatDate(team.updatedAt)}</span>
        </div>
      </CardContent>

      <CardFooter>
        <Button variant="outline" className="w-full">
          查看详情
        </Button>
      </CardFooter>
    </AnimatedCard>
  )
}
