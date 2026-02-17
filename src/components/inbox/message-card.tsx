'use client'

/**
 * MessageCard - 消息卡片组件
 */

import { InboxMessage, MessageType, ProtocolMessageType } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface MessageCardProps {
  message: InboxMessage
}

const protocolTypeLabels: Record<ProtocolMessageType, string> = {
  [ProtocolMessageType.IDLE_NOTIFICATION]: '空闲通知',
  [ProtocolMessageType.SHUTDOWN_REQUEST]: '关闭请求',
  [ProtocolMessageType.SHUTDOWN_RESPONSE]: '关闭响应',
  [ProtocolMessageType.PLAN_APPROVAL_REQUEST]: '计划审批请求',
  [ProtocolMessageType.PLAN_APPROVAL_RESPONSE]: '计划审批响应',
}

const messageStyleConfig = {
  [MessageType.USER]: {
    wrapperClass: 'justify-end',
    cardClass: 'bg-primary text-primary-foreground ml-auto max-w-[80%]',
  },
  [MessageType.ASSISTANT]: {
    wrapperClass: 'justify-start',
    cardClass: 'bg-muted max-w-[80%]',
  },
  [MessageType.SYSTEM]: {
    wrapperClass: 'justify-center',
    cardClass: 'bg-muted/50 max-w-[90%] text-center text-muted-foreground text-sm',
  },
}

export function MessageCard({ message }: MessageCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const isProtocolMessage = !!message.protocolType
  const styleConfig = messageStyleConfig[message.type]
  const timeAgo = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
    locale: zhCN,
  })

  return (
    <div className={cn('flex', styleConfig.wrapperClass)}>
      <Card className={cn('shadow-sm', styleConfig.cardClass)}>
        <CardContent className="p-3 space-y-2">
          {/* 协议消息标记 */}
          {isProtocolMessage && (
            <div className="flex items-center justify-center">
              <Badge variant="outline" className="text-xs">
                {protocolTypeLabels[message.protocolType!]}
              </Badge>
            </div>
          )}

          {/* 消息头部：发送者和时间 */}
          {message.type !== MessageType.SYSTEM && (
            <div className="flex items-center gap-2 text-xs opacity-80">
              <Avatar className="h-5 w-5">
                <AvatarFallback className="text-[10px]">
                  {getInitials(message.from)}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{message.from}</span>
              {message.to && <span>→ {message.to}</span>}
              <span>•</span>
              <span>{timeAgo}</span>
              {!message.read && (
                <span className="ml-auto">• 未读</span>
              )}
            </div>
          )}

          {/* 消息摘要 */}
          {message.summary && (
            <div className="text-sm font-medium">{message.summary}</div>
          )}

          {/* 消息内容 */}
          <div className="text-sm break-words whitespace-pre-wrap">
            {message.text}
          </div>

          {/* 颜色标识（仅调试用） */}
          {message.color && process.env.NODE_ENV === 'development' && (
            <div className="flex items-center gap-2 mt-2">
              <div
                className="h-3 w-3 rounded-full border border-current"
                style={{ backgroundColor: message.color }}
              />
              <span className="text-xs opacity-60">{message.color}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
