/**
 * Task Service - 任务 API 服务
 */

import type { ApiResponse, Task, TaskStatus } from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const taskService = {
  /**
   * 获取所有任务
   */
  async getAll(): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks`)
    const data: ApiResponse<Task[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch tasks')
    }

    return data.data
  },

  /**
   * 根据 ID 获取任务
   */
  async getById(id: string): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`)
    const data: ApiResponse<Task> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch task')
    }

    return data.data
  },

  /**
   * 根据状态获取任务
   */
  async getByStatus(status: TaskStatus): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks?status=${status}`)
    const data: ApiResponse<Task[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch tasks')
    }

    return data.data
  },

  /**
   * 根据所有者获取任务
   */
  async getByOwner(owner: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/tasks?owner=${owner}`)
    const data: ApiResponse<Task[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch tasks')
    }

    return data.data
  },

  /**
   * 创建任务
   */
  async create(taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })

    const data: ApiResponse<Task> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to create task')
    }

    return data.data
  },

  /**
   * 更新任务
   */
  async update(id: string, taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(taskData),
    })

    const data: ApiResponse<Task> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update task')
    }

    return data.data
  },

  /**
   * 更新任务状态
   */
  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    const data: ApiResponse<Task> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to update task status')
    }

    return data.data
  },

  /**
   * 删除任务
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
      method: 'DELETE',
    })

    const data: ApiResponse<void> = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete task')
    }
  },
}
