'use client'

import { useState, useEffect, useMemo, memo, useCallback } from 'react'
import { Search, ChevronDown, ChevronRight } from 'lucide-react'
import { useInboxStore } from '@/lib/stores/inbox-store'
import { useTeamsStore } from '@/lib/stores/teams-store'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { Conversation, Member, MemberStatus } from '@/types'
import { cn } from '@/lib/utils'

export const Sidebar = memo(function Sidebar() {
  const {
    conversations,
    teamMembers,
    selectedConversationId,
    selectConversation,
    selectedTeamId,
    setTeamMembers,
  } = useInboxStore()

  const { members } = useTeamsStore()
  const { theme } = useSettingsStore()
  const isLight = theme === 'light'

  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(() => {
    return selectedTeamId ? new Set([selectedTeamId]) : new Set()
  })

  useEffect(() => {
    if (selectedTeamId) {
      setExpandedTeams(new Set([selectedTeamId]))
    }
  }, [selectedTeamId])

  // Sync team members when selectedTeamId changes
  useEffect(() => {
    if (selectedTeamId) {
      const teamMembersList = members.get(selectedTeamId) || []
      setTeamMembers(teamMembersList)
    } else {
      setTeamMembers([])
    }
  }, [selectedTeamId, members, setTeamMembers])

  // Create a list combining conversations and team members without messages
  const allItems = useMemo(() => {
    // Get agent names that already have conversations
    const agentNamesWithMessages = new Set(conversations.map(c => c.agentName))

    // Add team members without messages as placeholder conversations
    const membersWithoutMessages = teamMembers
      .filter(member => !agentNamesWithMessages.has(member.name))
      .map(member => ({
        id: `${selectedTeamId}-${member.name}`,
        teamId: selectedTeamId || '',
        teamName: selectedTeamId || '',
        agentName: member.name,
        agentColor: member.color || '#8B5CF6',
        lastMessage: {
          text: '暂无消息',
          timestamp: new Date(),
          type: 'assistant' as const,
        },
        unreadCount: 0,
        isOnline: member.status !== MemberStatus.OFFLINE,
        status: member.status,
        _isPlaceholder: true, // Mark as placeholder for members without messages
      })) as (Conversation & { _isPlaceholder?: boolean })[]

    return [...conversations, ...membersWithoutMessages]
  }, [conversations, teamMembers, selectedTeamId])

  const groupedConversations = useMemo(() => {
    return allItems.reduce((acc, conv) => {
      if (!acc[conv.teamId]) {
        acc[conv.teamId] = []
      }
      acc[conv.teamId].push(conv)
      return acc
    }, {} as Record<string, Conversation[]>)
  }, [allItems])

  const filteredGroupedConversations = useMemo(() => {
    return Object.entries(groupedConversations).reduce((acc, [teamId, convs]) => {
      const filtered = searchQuery
        ? convs.filter((c) => c.agentName.toLowerCase().includes(searchQuery.toLowerCase()))
        : convs
      if (filtered.length > 0) {
        acc[teamId] = filtered
      }
      return acc
    }, {} as Record<string, Conversation[]>)
  }, [groupedConversations, searchQuery])

  const toggleTeam = useCallback((teamId: string) => {
    setExpandedTeams((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(teamId)) {
        newExpanded.delete(teamId)
      } else {
        newExpanded.add(teamId)
      }
      return newExpanded
    })
  }, [])

  return (
    <aside className={`w-72 min-w-[240px] max-w-[400px] border-r flex flex-col ${
      isLight
        ? 'bg-white border-gray-200'
        : 'bg-background-secondary border-slate-700'
    }`}>
      <div className={`p-3 border-b ${isLight ? 'border-gray-200' : 'border-slate-700'}`}>
        <div className="relative">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isLight ? 'text-gray-400' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="搜索会话..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-10 pr-4 py-2 rounded-lg text-sm focus:outline-none ${
              isLight
                ? 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary'
                : 'bg-background-tertiary border border-slate-600 text-slate-200 placeholder-slate-500 focus:border-slate-500'
            }`}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {Object.entries(filteredGroupedConversations).map(([teamId, convs]) => (
          <div key={teamId} className={`border-b ${isLight ? 'border-gray-100' : 'border-slate-700/50'}`}>
            <button
              onClick={() => toggleTeam(teamId)}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium uppercase transition-colors cursor-pointer ${
                isLight
                  ? 'text-gray-500 hover:bg-gray-50'
                  : 'text-slate-400 hover:bg-background-tertiary'
              }`}
            >
              {expandedTeams.has(teamId) ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
              {teamId}
            </button>

            {expandedTeams.has(teamId) && convs.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                isSelected={conv.id === selectedConversationId}
                onClick={() => selectConversation(conv.id)}
                isLight={isLight}
              />
            ))}
          </div>
        ))}

        {Object.keys(filteredGroupedConversations).length === 0 && (
          <div className={`p-4 text-center text-sm ${isLight ? 'text-gray-400' : 'text-slate-500'}`}>
            {searchQuery ? '没有匹配的会话' : '暂无会话'}
          </div>
        )}
      </div>
    </aside>
  )
})

interface ConversationItemProps {
  conversation: Conversation
  isSelected: boolean
  onClick: () => void
  isLight: boolean
}

const ConversationItem = memo(function ConversationItem({ conversation, isSelected, onClick, isLight }: ConversationItemProps) {
  const formatTime = (timestamp: Date | string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 px-3 py-2 transition-colors cursor-pointer text-left',
        isSelected
          ? isLight
            ? 'bg-primary/5 border-l-2 border-primary'
            : 'bg-slate-700/50 border-l-2 border-accent-primary'
          : isLight
            ? 'hover:bg-gray-50'
            : 'hover:bg-background-tertiary'
      )}
    >
      <div className="relative flex-shrink-0">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
          style={{ backgroundColor: conversation.agentColor }}
        >
          {conversation.agentName.charAt(0).toUpperCase()}
        </div>
        <span
          className={cn(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2',
            isLight ? 'border-white' : 'border-background-secondary',
            conversation.status === MemberStatus.ACTIVE && 'bg-live',
            conversation.status === MemberStatus.IDLE && 'bg-amber-400',
            conversation.status === MemberStatus.BUSY && 'bg-accent-info',
            conversation.status === MemberStatus.OFFLINE && 'bg-slate-500'
          )}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={cn(
            'font-medium text-sm truncate',
            isLight ? 'text-gray-800' : 'text-slate-200'
          )}>
            {conversation.agentName}
          </span>
          <span className={cn('text-xs', isLight ? 'text-gray-400' : 'text-slate-500')}>
            {formatTime(conversation.lastMessage.timestamp)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className={cn('text-xs truncate', isLight ? 'text-gray-500' : 'text-slate-500')}>
            {conversation.lastMessage.text}
          </span>
          {conversation.unreadCount > 0 && (
            <span className="flex-shrink-0 w-5 h-5 bg-accent-primary rounded-full flex items-center justify-center text-xs text-white">
              {conversation.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
})
