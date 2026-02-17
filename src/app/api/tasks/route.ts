import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types/api'
import type { Task } from '@/lib/types'
import { fileWatcherManager } from '../../../../server/watchers'

/**
 * GET /api/tasks
 * 获取所有任务列表
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const taskId = searchParams.get('id')
    const teamId = searchParams.get('teamId')
    const status = searchParams.get('status')
    const owner = searchParams.get('owner')

    // 如果指定了 taskId，返回单个任务
    if (taskId) {
      const tasks = fileWatcherManager.getAllTasks()
      const task = tasks.find((t: Task) => t.id === taskId)

      if (!task) {
        const response: ApiResponse<Task> = {
          success: false,
          error: `Task with id "${taskId}" not found`
        }
        return NextResponse.json(response, { status: 404 })
      }

      const response: ApiResponse<Task> = {
        success: true,
        data: task
      }
      return NextResponse.json(response)
    }

    // 获取任务列表
    let tasks = teamId
      ? fileWatcherManager.getTeamTasks(teamId)
      : fileWatcherManager.getAllTasks()

    // 状态过滤
    if (status) {
      tasks = tasks.filter((task: Task) => task.status === status)
    }

    // 负责人过滤
    if (owner) {
      tasks = tasks.filter((task: Task) => task.owner === owner)
    }

    // 搜索过滤
    const search = searchParams.get('search')
    if (search) {
      const searchLower = search.toLowerCase()
      tasks = tasks.filter((task: Task) =>
        task.subject.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower)
      )
    }

    const response: ApiResponse<Task[]> = {
      success: true,
      data: tasks,
      meta: {
        total: tasks.length,
        page: 1,
        limit: tasks.length
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/tasks:', error)

    const response: ApiResponse<Task[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return NextResponse.json(response, { status: 500 })
  }
}
