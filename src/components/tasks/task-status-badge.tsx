'use client'

/**
 * TaskStatusBadge - 任务状态徽章组件
 */

import { TaskStatus } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { StatusIndicator } from '@/components/animations/status-indicator'
import { cn } from '@/lib/utils'

interface TaskStatusBadgeProps {
  status: TaskStatus
  showIndicator?: boolean
}

const statusConfig = {
  [TaskStatus.PENDING]: {
    label: '待处理',
    variant: 'secondary' as const,
    indicatorStatus: 'offline' as const,
    className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  [TaskStatus.IN_PROGRESS]: {
    label: '进行中',
    variant: 'default' as const,
    indicatorStatus: 'busy' as const,
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  },
  [TaskStatus.COMPLETED]: {
    label: '已完成',
    variant: 'default' as const,
    indicatorStatus: 'online' as const,
    className: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  },
  [TaskStatus.FAILED]: {
    label: '失败',
    variant: 'destructive' as const,
    indicatorStatus: 'error' as const,
    className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  },
  [TaskStatus.CANCELLED]: {
    label: '已取消',
    variant: 'outline' as const,
    indicatorStatus: 'offline' as const,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  [TaskStatus.DELETED]: {
    label: '已删除',
    variant: 'outline' as const,
    indicatorStatus: 'offline' as const,
    className: 'opacity-50',
  },
}

export function TaskStatusBadge({ status, showIndicator = false }: TaskStatusBadgeProps) {
  const config = statusConfig[status]

  if (!config) {
    return <Badge>{status}</Badge>
  }

  return (
    <Badge variant={config.variant} className={cn(config.className)}>
      {showIndicator && (
        <StatusIndicator
          status={config.indicatorStatus}
          showPulse={status === TaskStatus.IN_PROGRESS}
          className="mr-1.5"
        />
      )}
      {config.label}
    </Badge>
  )
}
