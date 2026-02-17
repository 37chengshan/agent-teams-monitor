import { NextRequest, NextResponse } from 'next/server'
import { ApiResponse } from '@/lib/types/api'
import type { InboxMessage } from '@/lib/types'
import { fileWatcherManager } from '../../../../server/watchers'

/**
 * GET /api/inbox
 * 获取所有消息或指定团队/接收者的消息
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const teamId = searchParams.get('teamId')
    const recipient = searchParams.get('recipient')
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // 获取消息列表
    let messages = teamId
      ? fileWatcherManager.getTeamMessages(teamId)
      : fileWatcherManager.getAllMessages()

    // 接收者过滤
    if (recipient) {
      messages = messages.filter((msg: InboxMessage) => msg.recipient === recipient)
    }

    // 消息类型过滤
    if (type) {
      messages = messages.filter((msg: InboxMessage) => msg.type === type)
    }

    // 仅未读过滤
    if (unreadOnly) {
      messages = messages.filter((msg: InboxMessage) => !msg.read)
    }

    // 搜索过滤
    const search = searchParams.get('search')
    if (search) {
      const searchLower = search.toLowerCase()
      messages = messages.filter((msg: InboxMessage) =>
        msg.text.toLowerCase().includes(searchLower) ||
        msg.summary?.toLowerCase().includes(searchLower) ||
        msg.from.toLowerCase().includes(searchLower)
      )
    }

    // 按时间戳倒序排序
    messages.sort((a: InboxMessage, b: InboxMessage) => b.timestamp.getTime() - a.timestamp.getTime())

    const response: ApiResponse<InboxMessage[]> = {
      success: true,
      data: messages,
      meta: {
        total: messages.length,
        page: 1,
        limit: messages.length
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/inbox:', error)

    const response: ApiResponse<InboxMessage[]> = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return NextResponse.json(response, { status: 500 })
  }
}
