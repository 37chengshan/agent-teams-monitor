'use client'

import { memo, useMemo } from 'react'
import { Task, TaskStatus } from '@/types'
import { TaskItem } from './task-item'

interface TaskListProps {
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (taskId: string) => void
}

const priority: Record<TaskStatus, number> = {
  [TaskStatus.IN_PROGRESS]: 0,
  [TaskStatus.PENDING]: 1,
  [TaskStatus.BLOCKED]: 2,
  [TaskStatus.COMPLETED]: 3,
}

export const TaskList = memo(function TaskList({ tasks, selectedTaskId, onSelectTask }: TaskListProps) {
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => {
      const priorityDiff = priority[a.status] - priority[b.status]
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }, [tasks])

  if (sortedTasks.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-slate-400">
        <p>暂无任务</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sortedTasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onClick={() => onSelectTask(task.id)}
        />
      ))}
    </div>
  )
})
