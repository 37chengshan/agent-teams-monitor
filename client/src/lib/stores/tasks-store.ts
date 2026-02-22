'use client'

import { create } from 'zustand'
import { Task, TaskStatus } from '@/types'

interface TasksState {
  tasks: Task[]
  selectedTaskId: string | null
  filter: {
    status?: TaskStatus
    owner?: string
    teamId?: string
  }
  isLoading: boolean
  error: string | null
}

interface TasksActions {
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: string, updates: Partial<Task>) => void
  deleteTask: (taskId: string) => void
  selectTask: (taskId: string | null) => void
  setFilter: (filter: TasksState['filter']) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

export const useTasksStore = create<TasksState & TasksActions>((set) => ({
  tasks: [],
  selectedTaskId: null,
  filter: {},
  isLoading: false,
  error: null,

  setTasks: (tasks) => set({ tasks }),

  addTask: (task) =>
    set((state) => ({
      tasks: [...state.tasks, task],
    })),

  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),

  deleteTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  selectTask: (taskId) => set({ selectedTaskId: taskId }),

  setFilter: (filter) => set({ filter }),

  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
