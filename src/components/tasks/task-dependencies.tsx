'use client'

/**
 * TaskDependencies - 任务依赖关系可视化组件
 */

import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Blocks, ArrowRight, AlertCircle } from 'lucide-react'

interface TaskDependenciesProps {
  tasks: Task[]
  currentTaskId: string
}

export function TaskDependencies({ tasks, currentTaskId }: TaskDependenciesProps) {
  const currentTask = tasks.find((t) => t.id === currentTaskId)

  if (!currentTask) {
    return null
  }

  const blockedByTasks = (currentTask.blockedBy || [])
    .map((id) => tasks.find((t) => t.id === id))
    .filter(Boolean) as Task[]

  const blockingTasks = (currentTask.blocks || [])
    .map((id) => tasks.find((t) => t.id === id))
    .filter(Boolean) as Task[]

  if (blockedByTasks.length === 0 && blockingTasks.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground text-sm">
            此任务无依赖关系
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* 被阻塞的任务 */}
      {blockedByTasks.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
              被以下任务阻塞
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockedByTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30"
              >
                <Blocks className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{task.subject}</div>
                  <div className="text-xs text-muted-foreground">ID: {task.id}</div>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  {task.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 阻塞的任务 */}
      {blockingTasks.length > 0 && (
        <Card className="border-blue-200 dark:border-blue-900">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <ArrowRight className="h-5 w-5" />
              阻塞以下任务
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30"
              >
                <ArrowRight className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{task.subject}</div>
                  <div className="text-xs text-muted-foreground">ID: {task.id}</div>
                </div>
                <Badge variant="outline" className="flex-shrink-0">
                  {task.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
