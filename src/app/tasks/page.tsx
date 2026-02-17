'use client'

import { MotionContainer } from '@/components/animations'
import { PageContainer } from '@/components/layout'
import { TaskList } from '@/components/tasks'

export default function TasksPage() {
  return (
    <PageContainer>
      <MotionContainer animation="fade">
        <div className="space-y-8">
          {/* 页面标题 */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              任务管理
            </h1>
            <p className="text-muted-foreground">
              跟踪和管理所有 AI 代理任务的执行状态
            </p>
          </div>

          {/* 任务列表 */}
          <TaskList />
        </div>
      </MotionContainer>
    </PageContainer>
  )
}
