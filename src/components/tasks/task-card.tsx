'use client'

/**
 * TaskCard - 任务卡片组件
 */

import { Task } from '@/lib/types'
import { AnimatedCard } from '@/components/animations/animated-card'
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { TaskStatusBadge } from './task-status-badge'
import { Button } from '@/components/ui/button'
import { User, Clock, Blocks, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isBlocked = task.blockedBy && task.blockedBy.length > 0
  const isBlocking = task.blocks && task.blocks.length > 0

  return (
    <AnimatedCard hover={false}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">{task.subject}</CardTitle>
              <TaskStatusBadge status={task.status} />
            </div>
            {task.description && (
              <CardDescription className="line-clamp-2">
                {task.description}
              </CardDescription>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* 负责人 */}
        {task.owner && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>负责人: {task.owner}</span>
          </div>
        )}

        {/* 依赖关系 */}
        {(isBlocked || isBlocking) && (
          <div className="space-y-2">
            {isBlocked && (
              <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
                <Blocks className="h-4 w-4" />
                <span>
                  被 {task.blockedBy.length} 个任务阻塞
                </span>
              </div>
            )}
            {isBlocking && (
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                <ArrowRight className="h-4 w-4" />
                <span>
                  阻塞 {task.blocks.length} 个任务
                </span>
              </div>
            )}
          </div>
        )}

        {/* 时间信息 */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>创建于 {formatDate(task.createdAt)}</span>
          {task.completedAt && (
            <>
              <span>•</span>
              <span>完成于 {formatDate(task.completedAt)}</span>
            </>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "w-full",
            isBlocked && "text-amber-600 hover:text-amber-700 dark:text-amber-400"
          )}
        >
          查看详情
        </Button>
      </CardFooter>
    </AnimatedCard>
  )
}
