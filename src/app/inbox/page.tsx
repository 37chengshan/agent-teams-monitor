'use client'

import { useState } from 'react'
import { MotionContainer } from '@/components/animations'
import { PageContainer } from '@/components/layout'
import { MessageFilter, MessageList } from '@/components/inbox'
import { useInbox } from '@/lib/hooks'
import { MessageType } from '@/lib/types'

export default function InboxPage() {
  const [currentType, setCurrentType] = useState('all')
  const { messages } = useInbox()

  // 计算各类型消息数量
  const counts = {
    all: messages.length,
    user: messages.filter(m => m.type === MessageType.USER).length,
    assistant: messages.filter(m => m.type === MessageType.ASSISTANT).length,
    system: messages.filter(m => m.type === MessageType.SYSTEM).length,
    protocol: messages.filter(m => m.protocolType).length,
  }

  return (
    <PageContainer>
      <MotionContainer animation="fade">
        <div className="space-y-8">
          {/* 页面标题 */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              消息中心
            </h1>
            <p className="text-muted-foreground">
              查看和处理团队间的通信消息
            </p>
          </div>

          {/* 消息过滤器和列表 */}
          <div className="space-y-6">
            <MessageFilter
              currentType={currentType}
              onTypeChange={setCurrentType}
              counts={counts}
            />
            <MessageList typeFilter={currentType} />
          </div>
        </div>
      </MotionContainer>
    </PageContainer>
  )
}
