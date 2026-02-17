'use client'

/**
 * TaskList - 任务列表容器组件
 */

import { TaskCard } from './task-card'
import { MotionList } from '@/components/animations/motion-list'
import { Card, CardContent } from '@/components/ui/card'
import { useTaskStore } from '@/lib/stores/task-store'

interface TaskListProps {
  teamId?: string
  statusFilter?: string
}

export function TaskList({ teamId, statusFilter }: TaskListProps) {
  const { tasks, loading } = useTaskStore()

  // 过滤任务
  const filteredTasks = tasks.filter((task) => {
    if (teamId && task.metadata?.teamId !== teamId) return false
    if (statusFilter && task.status !== statusFilter) return false
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            暂无任务数据
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <MotionList className="space-y-3">
      {filteredTasks.map((task) => (
        <TaskCard key={task.id} task={task} />
      ))}
    </MotionList>
  )
}
