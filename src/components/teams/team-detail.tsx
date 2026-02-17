'use client'

/**
 * TeamDetail - 团队详情组件
 */

import { Team } from '@/lib/types'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { MemberList } from './member-list'
import { Users, FileText, Clock } from 'lucide-react'

interface TeamDetailProps {
  team: Team
}

export function TeamDetail({ team }: TeamDetailProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-6">
      {/* 团队基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{team.name}</CardTitle>
          {team.description && (
            <CardDescription className="mt-2 text-base">
              {team.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">成员数量:</span>
              <Badge variant="secondary">{team.memberCount}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">配置文件:</span>
              <Badge variant="outline" className="text-xs">
                {team.filepath}
              </Badge>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>创建时间</span>
              </div>
              <div className="mt-1">{formatDate(team.createdAt)}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>更新时间</span>
              </div>
              <div className="mt-1">{formatDate(team.updatedAt)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 成员列表 */}
      <Card>
        <CardHeader>
          <CardTitle>团队成员</CardTitle>
        </CardHeader>
        <CardContent>
          <MemberList members={team.members} />
        </CardContent>
      </Card>
    </div>
  )
}
