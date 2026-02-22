'use client'

import { useEffect, useRef, useState, memo, useCallback } from 'react'
import { Search, Filter, MoreVertical, Check, FileJson } from 'lucide-react'
import { useInboxStore } from '@/lib/stores/inbox-store'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { InboxMessage, MessageType, MessageFilters } from '@/types'
import { cn } from '@/lib/utils'

export const ChatPanel = memo(function ChatPanel() {
  const {
    filteredMessages,
    selectedConversationId,
    selectedMessageId,
    selectMessage,
    toggleRead,
    showRawJson,
    setShowRawJson,
    filters,
    updateFilters,
    autoScroll,
    setAutoScroll,
  } = useInboxStore()

  const theme = useSettingsStore((state) => state.theme)
  const fontSize = useSettingsStore((state) => state.fontSize)
  const layoutMode = useSettingsStore((state) => state.layoutMode)

  const isLight = theme === 'light'
  const isCompact = layoutMode === 'compact'

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showNewMessageIndicator, setShowNewMessageIndicator] = useState(false)
  const [prevMessageCount, setPrevMessageCount] = useState(filteredMessages.length)

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
      setShowNewMessageIndicator(false)
    } else if (filteredMessages.length > prevMessageCount) {
      setShowNewMessageIndicator(true)
    }
    setPrevMessageCount(filteredMessages.length)
  }, [filteredMessages.length, autoScroll, prevMessageCount])

  useEffect(() => {
    if (selectedConversationId && autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' })
    }
  }, [selectedConversationId, autoScroll])

  const handleScrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    setShowNewMessageIndicator(false)
  }, [])

  if (!selectedConversationId) {
    return (
      <div className={`flex-1 flex items-center justify-center ${
        isLight ? 'bg-gray-50' : 'bg-background-primary'
      }`}>
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
            isLight ? 'bg-gray-100' : 'bg-background-secondary'
          }`}>
            <Search className={`w-8 h-8 ${isLight ? 'text-gray-400' : 'text-slate-500'}`} />
          </div>
          <p className={isLight ? 'text-gray-400' : 'text-slate-400'}>现在还没有消息请等待</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex-1 flex flex-col overflow-hidden ${
      isLight ? 'bg-gray-50' : 'bg-background-primary'
    }`}>
      <FilterBar
        filters={filters}
        onFilterChange={updateFilters}
        autoScroll={autoScroll}
        onAutoScrollChange={setAutoScroll}
        isLight={isLight}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {filteredMessages.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${
            isLight ? 'text-gray-400' : 'text-slate-500'
          }`}>
            暂无消息
          </div>
        ) : (
          <div className={isCompact ? 'space-y-2' : 'space-y-4'}>
            {filteredMessages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isSelected={message.id === selectedMessageId}
                onSelect={() => selectMessage(message.id)}
                onToggleRead={() => toggleRead(message.id)}
                onViewRaw={() => setShowRawJson(showRawJson === message.id ? null : message.id)}
                showRawJson={showRawJson === message.id}
                fontSize={fontSize}
                isCompact={isCompact}
                isLight={isLight}
                isFirst={index === 0}
              />
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {showNewMessageIndicator && !autoScroll && (
        <button
          onClick={handleScrollToBottom}
          className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-accent-primary text-white px-4 py-2 rounded-full shadow-lg cursor-pointer animate-bounce flex items-center gap-2"
        >
          新消息
          <span>↓</span>
        </button>
      )}
    </div>
  )
})

interface FilterBarProps {
  filters: MessageFilters
  onFilterChange: (updates: Partial<MessageFilters>) => void
  autoScroll: boolean
  onAutoScrollChange: (value: boolean) => void
  isLight: boolean
}

const FilterBar = memo(function FilterBar({ filters, onFilterChange, autoScroll, onAutoScrollChange, isLight }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={`border-b p-2 flex-shrink-0 ${
      isLight ? 'border-gray-200 bg-white' : 'border-slate-700 bg-background-secondary'
    }`}>
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            isLight ? 'text-gray-400' : 'text-slate-400'
          }`} />
          <input
            type="text"
            placeholder="搜索消息..."
            value={filters.searchQuery || ''}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className={`w-full pl-10 pr-4 py-1.5 rounded-lg text-sm focus:outline-none ${
              isLight
                ? 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-primary'
                : 'bg-background-tertiary border border-slate-600 text-slate-200 placeholder-slate-500 focus:border-slate-500'
            }`}
          />
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors',
            isExpanded
              ? 'bg-accent-primary text-white'
              : isLight
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-background-tertiary text-slate-300 hover:bg-slate-600'
          )}
        >
          <Filter className="w-4 h-4" />
          筛选
        </button>

        <button
          onClick={() => onAutoScrollChange(!autoScroll)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors',
            autoScroll
              ? isLight
                ? 'bg-green-100 text-green-600'
                : 'bg-live/20 text-live'
              : isLight
                ? 'bg-gray-100 text-gray-400'
                : 'bg-background-tertiary text-slate-400'
          )}
        >
          {autoScroll ? '自动滚动' : '手动滚动'}
        </button>
      </div>

      {isExpanded && (
        <div className={`mt-2 pt-2 flex gap-2 ${
          isLight ? 'border-t border-gray-200' : 'border-t border-slate-700'
        }`}>
          <select
            value={filters.type || 'all'}
            onChange={(e) => onFilterChange({ type: e.target.value as MessageFilters['type'] })}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isLight
                ? 'bg-gray-100 border border-gray-200 text-gray-700'
                : 'bg-background-tertiary border border-slate-600 text-slate-200'
            }`}
          >
            <option value="all">全部类型</option>
            <option value="user">用户消息</option>
            <option value="assistant">助手消息</option>
            <option value="protocol">协议消息</option>
          </select>

          <select
            value={filters.status || 'all'}
            onChange={(e) => onFilterChange({ status: e.target.value as MessageFilters['status'] })}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              isLight
                ? 'bg-gray-100 border border-gray-200 text-gray-700'
                : 'bg-background-tertiary border border-slate-600 text-slate-200'
            }`}
          >
            <option value="all">全部状态</option>
            <option value="unread">未读</option>
            <option value="read">已读</option>
          </select>
        </div>
      )}
    </div>
  )
})

interface MessageBubbleProps {
  message: InboxMessage
  isSelected: boolean
  isCompact?: boolean
  fontSize?: number
  isLight: boolean
  isFirst: boolean
  onSelect: () => void
  onToggleRead: () => void
  onViewRaw: () => void
  showRawJson: boolean
}

const MessageBubble = memo(function MessageBubble({
  message,
  isSelected,
  isCompact = false,
  fontSize = 14,
  isLight,
  isFirst,
  onSelect,
  onToggleRead,
  onViewRaw,
  showRawJson,
}: MessageBubbleProps) {
  const isProtocol = message.type === MessageType.PROTOCOL

  const formatTime = (timestamp: Date | string) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // Different background colors for message bubbles in light mode to create visual separation
  const getBubbleStyle = () => {
    if (isProtocol) {
      return isLight ? 'bg-red-50 border-l-4 border-red-400' : 'bg-red-500/10 border-l-4 border-red-500'
    }
    if (isLight) {
      // Use agent color hash to generate distinct background colors for each agent
      const colorHash = message.from.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
      // Generate light pastel background colors for depth
      const lightness = 95 + ((colorHash * 7) % 5) // Vary between 95-100%
      const saturation = 20 + (colorHash % 15) // Vary between 20-35%
      return `border-l-4 shadow-lg`
    }
    return 'bg-background-secondary'
  }

  // For light mode, add inline style for background color based on agent to create depth
  const getBackgroundColor = () => {
    if (!isLight || isProtocol) return undefined

    // Generate a color based on agent name - light pastel backgrounds for depth
    const colorHash = message.from.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue = (colorHash * 37) % 360
    const saturation = 35 + (colorHash % 20) // 35-55%
    const lightness = 93 + (colorHash % 5) // 93-98% - deeper pastels
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
  }

  return (
    <div
      className={cn(
        'group relative p-3 rounded-lg message-enter overflow-hidden shadow-md',
        isCompact ? 'p-1.5' : '',
        getBubbleStyle(),
        isSelected && (isLight ? 'ring-2 ring-primary' : 'ring-2 ring-accent-primary')
      )}
      style={getBackgroundColor() ? { backgroundColor: getBackgroundColor() } : undefined}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className={cn(
            'font-medium text-sm truncate',
            isLight ? 'text-gray-800' : 'text-slate-200'
          )}>
            {message.from}
          </span>
          {isProtocol && (
            <span className={cn(
              'flex-shrink-0 px-2 py-0.5 text-xs rounded',
              isLight ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-400'
            )}>
              协议消息
            </span>
          )}
        </div>
        <span className={cn(
          'flex-shrink-0 text-xs ml-2',
          isLight ? 'text-gray-400' : 'text-slate-500'
        )}>
          {formatTime(message.timestamp)}
        </span>
      </div>

      <p className={cn(
        'text-sm whitespace-pre-wrap break-words overflow-hidden',
        isLight ? 'text-gray-600' : 'text-slate-300'
      )} style={{ fontSize }}>
        {message.text}
      </p>

      {showRawJson && (
        <pre className={cn(
          'mt-2 p-2 rounded text-xs overflow-x-auto',
          isLight ? 'bg-gray-100 text-gray-500' : 'bg-black/50 text-slate-400'
        )}>
          {JSON.stringify(message, null, 2)}
        </pre>
      )}

      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onToggleRead()
          }}
          className={cn(
            'p-1.5 rounded cursor-pointer',
            isLight ? 'hover:bg-gray-200' : 'hover:bg-slate-600'
          )}
          title={message.read ? '标记未读' : '标记已读'}
        >
          <Check className={cn(
            'w-4 h-4',
            message.read
              ? isLight ? 'text-green-500' : 'text-live'
              : isLight ? 'text-gray-400' : 'text-slate-400'
          )} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onViewRaw()
          }}
          className={cn(
            'p-1.5 rounded cursor-pointer',
            isLight ? 'hover:bg-gray-200' : 'hover:bg-slate-600'
          )}
          title="查看原始JSON"
        >
          <FileJson className={cn(
            'w-4 h-4',
            showRawJson
              ? isLight ? 'text-primary' : 'text-accent-primary'
              : isLight ? 'text-gray-400' : 'text-slate-400'
          )} />
        </button>
      </div>

      {!message.read && (
        <span className="absolute bottom-2 right-2 w-2 h-2 bg-accent-primary rounded-full" />
      )}
    </div>
  )
})
