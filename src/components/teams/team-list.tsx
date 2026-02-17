'use client'

/**
 * TeamList - 团队列表容器组件
 */

import { TeamCard } from './team-card'
import { MotionList } from '@/components/animations/motion-list'
import { Card, CardContent } from '@/components/ui/card'
import { useTeams } from '@/lib/hooks'

export function TeamList() {
  const { teams, loading } = useTeams()

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (teams.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            暂无团队数据
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MotionList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </MotionList>
  )
}
