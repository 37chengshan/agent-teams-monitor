'use client'

import { memo } from 'react'
import { User, Clock, MoreVertical } from 'lucide-react'
import { Task, TaskStatus } from '@/types'

interface TaskItemProps {
  task: Task
  onStatusChange?: (status: TaskStatus) => void
  onClick?: () => void
}

const statusColors: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: 'text-slate-400',
  [TaskStatus.IN_PROGRESS]: 'text-accent-primary',
  [TaskStatus.COMPLETED]: 'text-accent-success',
  [TaskStatus.BLOCKED]: 'text-accent-error',
}

const statusLabels: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: '待处理',
  [TaskStatus.IN_PROGRESS]: '进行中',
  [TaskStatus.COMPLETED]: '已完成',
  [TaskStatus.BLOCKED]: '已阻塞',
}

export const TaskItem = memo(function TaskItem({ task, onStatusChange, onClick }: TaskItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 bg-background-secondary border border-slate-700 rounded-lg hover:border-slate-600 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-sm font-medium text-slate-100 line-clamp-1">
          {task.subject}
        </h4>
        <button
          onClick={(e) => e.stopPropagation()}
          className="p-1 hover:bg-background-tertiary rounded cursor-pointer"
        >
          <MoreVertical className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-slate-500">
        {task.owner && (
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span>{task.owner}</span>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>
            更新于 {new Date(task.updatedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        <span className={`font-medium ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </span>
      </div>
    </button>
  )
})
