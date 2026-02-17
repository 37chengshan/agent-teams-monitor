/**
 * useRealtimeData - 综合实时数据 Hook
 *
 * 整合所有实时数据源，提供统一的数据访问接口
 */

import { useEffect } from 'react'
import { socketClient } from '@/lib/socket'
import { useTeams } from './use-teams'
import { useTasks } from './use-tasks'
import { useInbox } from './use-inbox'

export function useRealtimeData() {
  const teams = useTeams()
  const tasks = useTasks()
  const inbox = useInbox()

  useEffect(() => {
    // 订阅所有频道
    if (socketClient.isConnected()) {
      socketClient.subscribe(['all'])
    }
  }, [])

  /**
   * 刷新所有数据
   */
  const refreshAll = () => {
    teams.fetchTeams()
    tasks.fetchTasks()
    inbox.fetchMessages()
  }

  return {
    // 团队数据
    teams: teams.teams,
    teamsLoading: teams.loading,
    teamsError: teams.error,
    fetchTeams: teams.fetchTeams,

    // 任务数据
    tasks: tasks.tasks,
    tasksLoading: tasks.loading,
    tasksError: tasks.error,
    fetchTasks: tasks.fetchTasks,
    getTasksByStatus: tasks.getTasksByStatus,
    getTasksByOwner: tasks.getTasksByOwner,

    // 消息数据
    messages: inbox.messages,
    messagesLoading: inbox.loading,
    messagesError: inbox.error,
    fetchMessages: inbox.fetchMessages,
    markAsRead: inbox.markAsRead,
    markAllAsRead: inbox.markAllAsRead,

    // 综合操作
    refreshAll,
  }
}
