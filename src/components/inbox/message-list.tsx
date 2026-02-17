'use client'

/**
 * MessageList - 消息列表组件
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCard } from './message-card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useInboxStore } from '@/lib/stores/inbox-store'
import { MessageType } from '@/lib/types'
import { Search, ChevronDown, ChevronUp, ArrowDownToLine } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MessageListProps {
  teamId?: string
  typeFilter?: string
  senderFilter?: string
}

export function MessageList({ teamId, typeFilter, senderFilter }: MessageListProps) {
  const { messages, loading, markAllAsRead, getUnreadCount } = useInboxStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())

  // 检查是否在底部
  const isAtBottom = useCallback(() => {
    if (!scrollRef.current) return true
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current
    return scrollHeight - scrollTop - clientHeight < 100
  }, [])

  // 自动滚动到底部
  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, autoScroll])

  // 监听滚动事件来更新自动滚动状态
  useEffect(() => {
    const scrollElement = scrollRef.current
    if (!scrollElement) return

    const handleScroll = () => {
      setAutoScroll(isAtBottom())
    }

    scrollElement.addEventListener('scroll', handleScroll)
    return () => scrollElement.removeEventListener('scroll', handleScroll)
  }, [isAtBottom])

  // 过滤和搜索消息
  const getFilteredMessages = useCallback(() => {
    let filtered = messages

    // 按团队过滤
    if (teamId) {
      filtered = filtered.filter((m) => m.teamId === teamId)
    }

    // 按类型过滤
    if (typeFilter && typeFilter !== 'all') {
      filtered = filtered.filter((m) => m.type === typeFilter)
    }

    // 按发件人过滤
    if (senderFilter) {
      filtered = filtered.filter((m) => m.from === senderFilter)
    }

    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (m) =>
          m.text.toLowerCase().includes(query) ||
          m.summary?.toLowerCase().includes(query) ||
          m.from.toLowerCase().includes(query)
      )
    }

    return filtered
  }, [messages, teamId, typeFilter, senderFilter, searchQuery])

  const filteredMessages = getFilteredMessages()
  const unreadCount = getUnreadCount()

  // 按团队分组消息
  const groupedMessages = useCallback(() => {
    const groups: Record<string, typeof filteredMessages> = {}

    filteredMessages.forEach((message) => {
      const teamId = message.teamId || 'unknown'
      if (!groups[teamId]) {
        groups[teamId] = []
      }
      groups[teamId].push(message)
    })

    return groups
  }, [filteredMessages])

  const groups = groupedMessages()
  const teamIds = Object.keys(groups).sort()

  // 切换团队展开/折叠
  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) {
        next.delete(teamId)
      } else {
        next.add(teamId)
      }
      return next
    })
  }

  // 全部展开/折叠
  const expandAll = () => setExpandedTeams(new Set(teamIds))
  const collapseAll = () => setExpandedTeams(new Set())

  // 标记所有为已读
  const handleMarkAllRead = () => {
    markAllAsRead()
  }

  // 滚动到底部
  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    setAutoScroll(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 工具栏 */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="搜索消息内容..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-sm">
              {unreadCount} 未读
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
          >
            全部已读
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={scrollToBottom}
          >
            <ArrowDownToLine className="h-4 w-4 mr-1" />
            最新
          </Button>
        </div>
      </div>

      {/* 分组控制 */}
      {teamIds.length > 1 && (
        <div className="flex items-center justify-between border-b pb-2">
          <div className="text-sm text-muted-foreground">
            按{teamId ? '日期' : '团队'}分组 ({teamIds.length} 个团队)
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={expandAll}>
              展开
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              折叠
            </Button>
          </div>
        </div>
      )}

      {/* 消息列表 */}
      {filteredMessages.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              {searchQuery ? '没有找到匹配的消息' : '暂无消息'}
            </div>
          </CardContent>
        </Card>
      ) : (
        <ScrollArea className="h-[600px]">
          <div ref={scrollRef} className="space-y-4 p-4">
            {teamIds.length > 1 && !teamId ? (
              // 多团队分组显示
              teamIds.map((teamId) => {
                const teamMessages = groups[teamId]
                const isExpanded = expandedTeams.has(teamId) || expandedTeams.size === 0
                const firstMessage = teamMessages[0]

                return (
                  <div key={teamId} className="border rounded-lg overflow-hidden">
                    {/* 团队头部 */}
                    <button
                      onClick={() => toggleTeam(teamId)}
                      className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {teamId.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                          <div className="font-medium text-sm">{firstMessage?.teamId || teamId}</div>
                          <div className="text-xs text-muted-foreground">
                            {teamMessages.length} 条消息
                          </div>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>

                    {/* 团队消息 */}
                    {isExpanded && (
                      <div className="p-3 space-y-3 bg-background">
                        {teamMessages.map((message) => (
                          <MessageCard key={message.id} message={message} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              // 单一列表显示（已过滤或单团队）
              filteredMessages.map((message) => (
                <MessageCard key={message.id} message={message} />
              ))
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      )}

      {/* 自动滚动提示 */}
      {!autoScroll && filteredMessages.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={scrollToBottom}
          className="fixed bottom-20 right-8 shadow-lg"
        >
          新消息 ({filteredMessages.length})
        </Button>
      )}
    </div>
  )
}
