'use client'

/**
 * MessageFilter - 消息过滤组件
 */

import { MessageType } from '@/lib/types'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'

interface MessageFilterProps {
  currentType: string
  onTypeChange: (type: string) => void
  counts?: {
    all: number
    user: number
    assistant: number
    system: number
    protocol: number
  }
}

export function MessageFilter({ currentType, onTypeChange, counts }: MessageFilterProps) {
  const filters = [
    { value: 'all', label: '全部', count: counts?.all },
    { value: MessageType.USER, label: '用户', count: counts?.user },
    { value: MessageType.ASSISTANT, label: '助手', count: counts?.assistant },
    { value: MessageType.SYSTEM, label: '系统', count: counts?.system },
    { value: 'protocol', label: '协议', count: counts?.protocol },
  ]

  return (
    <Tabs value={currentType} onValueChange={onTypeChange} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        {filters.map((filter) => (
          <TabsTrigger key={filter.value} value={filter.value} className="relative">
            {filter.label}
            {filter.count !== undefined && filter.count > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 h-5 min-w-5 px-1 text-xs"
              >
                {filter.count}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
