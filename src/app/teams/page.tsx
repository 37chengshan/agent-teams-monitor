'use client'

import { MotionContainer } from '@/components/animations'
import { PageContainer } from '@/components/layout'
import { TeamList } from '@/components/teams'

export default function TeamsPage() {
  return (
    <PageContainer>
      <MotionContainer animation="fade">
        <div className="space-y-8">
          {/* 页面标题 */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              团队管理
            </h1>
            <p className="text-muted-foreground">
              查看和管理所有 AI 代理团队及其成员
            </p>
          </div>

          {/* 团队列表 */}
          <TeamList />
        </div>
      </MotionContainer>
    </PageContainer>
  )
}
