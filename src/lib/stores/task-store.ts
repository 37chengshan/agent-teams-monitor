/**
 * Task Store - 任务数据状态管理
 */

import { create } from 'zustand'
import type { Task, TaskStatus } from '@/lib/types/task'

interface TaskStore {
  // 状态
  tasks: Task[]
  loading: boolean
  error: string | null

  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (task: Task) => void
  updateTaskStatus: (taskId: string, status: TaskStatus) => void
  deleteTask: (taskId: string) => void
  removeTask: (taskId: string) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Selectors
  getTasksByStatus: (status: TaskStatus) => Task[]
  getTasksByOwner: (owner: string) => Task[]
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // 初始状态
  tasks: [],
  loading: false,
  error: null,

  // 设置所有任务
  setTasks: (tasks) => set({ tasks }),

  // 添加新任务 (不可变更新)
  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  // 更新任务 (不可变更新)
  updateTask: (task) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
    })),

  // 更新任务状态
  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status } : t
      ),
    })),

  // 删除任务 (不可变更新)
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  // 删除任务 (别名)
  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  // 设置加载状态
  setLoading: (loading) => set({ loading }),

  // 设置错误状态
  setError: (error) => set({ error }),

  // 根据状态获取任务
  getTasksByStatus: (status) => {
    const state = get()
    return state.tasks.filter((task) => task.status === status)
  },

  // 根据 owner 获取任务
  getTasksByOwner: (owner) => {
    const state = get()
    return state.tasks.filter((task) => task.owner === owner)
  },
}))
