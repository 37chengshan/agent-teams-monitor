'use client'

/**
 * SocketProvider - Socket.IO 客户端提供者
 */

import { useEffect } from 'react'
import { useSocket } from '@/lib/hooks/use-socket'
import { socketClient } from '@/lib/socket'
import { useTeamStore, useTaskStore, useInboxStore } from '@/lib/stores'
import type { Team, Task, InboxMessage } from '@/lib/types'

interface SocketProviderProps {
  children: React.ReactNode
}

export function SocketProvider({ children }: SocketProviderProps) {
  useSocket()

  useEffect(() => {
    // 团队数据更新
    const handleTeamUpdated = (data: { team: Team; timestamp: number }) => {
      useTeamStore.getState().updateTeam(data.team)
    }

    const handleTeamDeleted = (data: { teamId: string; timestamp: number }) => {
      useTeamStore.getState().deleteTeam(data.teamId)
    }

    // 任务数据更新
    const handleTaskUpdated = (data: { task: Task; timestamp: number }) => {
      useTaskStore.getState().updateTask(data.task)
    }

    const handleTaskDeleted = (data: { taskId: string; timestamp: number }) => {
      useTaskStore.getState().deleteTask(data.taskId)
    }

    // 消息数据更新
    const handleInboxMessage = (data: { message: InboxMessage; timestamp: number }) => {
      useInboxStore.getState().addMessage(data.message)
    }

    const handleError = (data: { message: string; code?: string }) => {
      console.error('Socket error:', data.message)
    }

    const handleConnected = (data: { clientId: string; timestamp: number }) => {
      console.log('Socket connected:', data.clientId)
    }

    // 注册所有事件监听器
    socketClient.on('team:updated', handleTeamUpdated)
    socketClient.on('team:deleted', handleTeamDeleted)

    socketClient.on('task:updated', handleTaskUpdated)
    socketClient.on('task:deleted', handleTaskDeleted)

    socketClient.on('inbox:message', handleInboxMessage)

    socketClient.on('error', handleError)
    socketClient.on('connected', handleConnected)

    // 清理函数
    return () => {
      socketClient.off('team:updated', handleTeamUpdated)
      socketClient.off('team:deleted', handleTeamDeleted)

      socketClient.off('task:updated', handleTaskUpdated)
      socketClient.off('task:deleted', handleTaskDeleted)

      socketClient.off('inbox:message', handleInboxMessage)

      socketClient.off('error', handleError)
      socketClient.off('connected', handleConnected)
    }
  }, [])

  return <>{children}</>
}
