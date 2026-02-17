/**
 * useTasks - 任务数据管理 Hook
 */

import { useEffect } from 'react'
import { socketClient } from '@/lib/socket'
import { useTaskStore } from '@/lib/stores'
import type { Task, TaskStatus } from '@/lib/types/task'

export function useTasks() {
  const {
    tasks,
    loading,
    error,
    setTasks,
    addTask,
    updateTask,
    removeTask,
    setLoading,
  } = useTaskStore()

  useEffect(() => {
    // 监听任务更新事件
    const handleTasksUpdated = (updatedTasks: Task[]) => {
      console.log('[useTasks] Tasks updated:', updatedTasks.length)
      setTasks(updatedTasks)
      setLoading(false)
    }

    const handleTaskCreated = (data: { task: Task; timestamp: number }) => {
      console.log('[useTasks] Task created:', data.task.id)
      addTask(data.task)
    }

    const handleTaskUpdated = (data: { task: Task; timestamp: number }) => {
      console.log('[useTasks] Task updated:', data.task.id)
      updateTask(data.task)
    }

    const handleTaskDeleted = (data: { taskId: string; timestamp: number }) => {
      console.log('[useTasks] Task deleted:', data.taskId)
      removeTask(data.taskId)
    }

    // 注册事件监听
    socketClient.on('tasks:updated', handleTasksUpdated)
    socketClient.on('task:created', handleTaskCreated)
    socketClient.on('task:updated', handleTaskUpdated)
    socketClient.on('task:deleted', handleTaskDeleted)

    // 清理函数
    return () => {
      socketClient.off('tasks:updated', handleTasksUpdated)
      socketClient.off('task:created', handleTaskCreated)
      socketClient.off('task:updated', handleTaskUpdated)
      socketClient.off('task:deleted', handleTaskDeleted)
    }
  }, [setTasks, addTask, updateTask, removeTask, setLoading])

  /**
   * 获取任务数据
   */
  const fetchTasks = () => {
    setLoading(true)
    socketClient.fetchTasks()
  }

  /**
   * 根据状态获取任务
   */
  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  /**
   * 根据 owner 获取任务
   */
  const getTasksByOwner = (owner: string) => {
    return tasks.filter((task) => task.owner === owner)
  }

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    getTasksByStatus,
    getTasksByOwner,
  }
}
