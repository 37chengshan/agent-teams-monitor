'use client'

import { createContext, useContext, ReactNode, useEffect, useState, useCallback } from 'react'
import { useSocket } from '@/hooks/useSocket'
import { useInboxStore } from '@/lib/stores/inbox-store'
import { useTeamsStore } from '@/lib/stores/teams-store'
import { useTasksStore } from '@/lib/stores/tasks-store'
import { useNotificationSound } from '@/hooks/useNotificationSound'
import { useDesktopNotifications } from '@/hooks/useDesktopNotifications'
import { ConnectionStatus } from './connection-status'
import { InboxMessage, Conversation, MemberStatus, MessageType, Team, Task } from '@/types'

interface SocketContextValue {
  isConnected: boolean
  connectionError: Error | null
  isConnecting: boolean
  emit: (event: string, data?: unknown) => void
  on: (event: string, callback: (...args: unknown[]) => void) => () => void
}

const SocketContext = createContext<SocketContextValue | null>(null)

interface SocketProviderProps {
  children: ReactNode
  url?: string
  demoMode?: boolean
}

export function SocketProvider({ children, url = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002', demoMode = false }: SocketProviderProps) {
  const { socket, isConnected, connectionError, emit, on, connect } = useSocket({ url, autoConnect: !demoMode })
  const { addMessage, setConversations, setMessages, selectTeam } = useInboxStore()
  const { setTeams } = useTeamsStore()
  const { setTasks } = useTasksStore()
  const [isConnecting, setIsConnecting] = useState(true)
  const { playSound } = useNotificationSound()
  const { showNotification } = useDesktopNotifications()

  useEffect(() => {
    if (!demoMode) return

    setTimeout(() => setIsConnecting(false), 1000)

    const demoConversations: Conversation[] = [
      {
        id: 'team-alpha-planner',
        teamId: 'team-alpha',
        teamName: 'Team Alpha',
        agentName: 'planner',
        agentColor: '#3B82F6',
        lastMessage: { text: '分析完成，准备开始实现', timestamp: new Date(), type: 'assistant' },
        unreadCount: 2,
        isOnline: true,
        status: MemberStatus.ACTIVE,
      },
      {
        id: 'team-alpha-code-reviewer',
        teamId: 'team-alpha',
        teamName: 'Team Alpha',
        agentName: 'code-reviewer',
        agentColor: '#22C55E',
        lastMessage: { text: '代码审查通过', timestamp: new Date(Date.now() - 300000), type: 'assistant' },
        unreadCount: 0,
        isOnline: true,
        status: MemberStatus.BUSY,
      },
      {
        id: 'team-beta-researcher',
        teamId: 'team-beta',
        teamName: 'Team Beta',
        agentName: 'researcher',
        agentColor: '#8B5CF6',
        lastMessage: { text: 'plan_approval_request 等待响应', timestamp: new Date(Date.now() - 600000), type: 'protocol' },
        unreadCount: 1,
        isOnline: true,
        status: MemberStatus.IDLE,
      },
    ]
    setConversations(demoConversations)

    const demoMessages: InboxMessage[] = [
      {
        id: '1',
        from: 'planner',
        text: '收到任务：实现用户认证系统',
        timestamp: new Date(Date.now() - 3600000),
        read: true,
        type: MessageType.ASSISTANT,
        teamId: 'team-alpha',
        recipient: 'planner',
      },
      {
        id: '2',
        from: 'planner',
        text: '分析完成，准备开始实现。步骤如下：\n1. 创建数据库模型\n2. 实现注册API\n3. 实现登录API\n4. 添加测试',
        timestamp: new Date(Date.now() - 1800000),
        read: true,
        type: MessageType.ASSISTANT,
        teamId: 'team-alpha',
        recipient: 'planner',
      },
      {
        id: '3',
        from: 'planner',
        text: '分析完成，准备开始实现',
        timestamp: new Date(),
        read: false,
        type: MessageType.ASSISTANT,
        teamId: 'team-alpha',
        recipient: 'planner',
      },
      {
        id: '4',
        from: 'planner',
        text: 'plan_approval_request: 需要您批准实现计划',
        timestamp: new Date(),
        read: false,
        type: MessageType.PROTOCOL,
        protocolType: 'plan_approval_request' as any,
        teamId: 'team-alpha',
        recipient: 'planner',
      },
      {
        id: '5',
        from: 'code-reviewer',
        text: '开始审查代码...',
        timestamp: new Date(Date.now() - 2400000),
        read: true,
        type: MessageType.ASSISTANT,
        teamId: 'team-alpha',
        recipient: 'code-reviewer',
      },
      {
        id: '6',
        from: 'code-reviewer',
        text: '发现2个问题：\n1. 缺少输入验证\n2. 错误处理不完整',
        timestamp: new Date(Date.now() - 1200000),
        read: true,
        type: MessageType.ASSISTANT,
        teamId: 'team-alpha',
        recipient: 'code-reviewer',
      },
      {
        id: '7',
        from: 'code-reviewer',
        text: '代码审查通过',
        timestamp: new Date(Date.now() - 300000),
        read: true,
        type: MessageType.ASSISTANT,
        teamId: 'team-alpha',
        recipient: 'code-reviewer',
      },
      {
        id: '8',
        from: 'researcher',
        text: '开始搜索相关资料...',
        timestamp: new Date(Date.now() - 1200000),
        read: true,
        type: MessageType.ASSISTANT,
        teamId: 'team-beta',
        recipient: 'researcher',
      },
      {
        id: '9',
        from: 'researcher',
        text: '找到3个相关方案，需要进一步分析',
        timestamp: new Date(Date.now() - 600000),
        read: true,
        type: MessageType.ASSISTANT,
        teamId: 'team-beta',
        recipient: 'researcher',
      },
      {
        id: '10',
        from: 'researcher',
        text: 'plan_approval_request: 需要您批准实现计划',
        timestamp: new Date(),
        read: false,
        type: MessageType.PROTOCOL,
        protocolType: 'plan_approval_request' as any,
        teamId: 'team-beta',
        recipient: 'researcher',
      },
    ]
    setMessages(demoMessages)
    selectTeam('team-alpha')
  }, [demoMode, setConversations, setMessages, selectTeam])

  useEffect(() => {
    if (demoMode || !socket) return

    setIsConnecting(false)

    emit('team:init')

    const unsubInboxMessage = on('inbox:message', (data) => {
      const message = data as InboxMessage
      addMessage(message)
      playSound()
      showNotification(`新消息 from ${message.from}`, message.text.slice(0, 100))
    })

    const unsubInboxUpdate = on('inbox:message:update', (data) => {
      const message = data as InboxMessage
      addMessage(message)
    })

    const unsubTeamsInitial = on('teams:initial', (data) => {
      const { teams } = data as { teams: Team[] }
      setTeams(teams)
      if (teams.length > 0) {
        selectTeam(teams[0].id)
      }
    })

    const unsubInboxInitial = on('inbox:initial', (data) => {
      const { messages } = data as { messages: InboxMessage[] }
      setMessages(messages)
    })

    const unsubTasksInitial = on('tasks:initial', (data) => {
      const { tasks } = data as { tasks: Task[] }
      setTasks(tasks)
    })

    return () => {
      unsubInboxMessage()
      unsubInboxUpdate()
      unsubTeamsInitial()
      unsubInboxInitial()
      unsubTasksInitial()
    }
  }, [socket, on, addMessage, demoMode, setTeams, setMessages, setTasks, selectTeam, emit, playSound, showNotification])

  const selectedTeamId = useInboxStore((state) => state.selectedTeamId)

  useEffect(() => {
    if (!socket || demoMode || !selectedTeamId) return
    emit('team:join', { teamId: selectedTeamId })
    emit('inbox:init', { teamId: selectedTeamId })
    emit('tasks:init', { teamId: selectedTeamId })
  }, [socket, selectedTeamId, emit, demoMode])

  const value: SocketContextValue = {
    isConnected: demoMode || isConnected,
    connectionError,
    isConnecting: demoMode || isConnecting,
    emit,
    on,
  }

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  )
}

export function useSocketContext() {
  const context = useContext(SocketContext)
  if (!context) {
    throw new Error('useSocketContext must be used within SocketProvider')
  }
  return context
}

export { ConnectionStatus }
