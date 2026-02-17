/**
 * Inbox Service - 消息 API 服务
 */

import type { ApiResponse, InboxMessage, MessageType } from '@/lib/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'

export const inboxService = {
  /**
   * 获取所有消息
   */
  async getAll(): Promise<InboxMessage[]> {
    const response = await fetch(`${API_BASE_URL}/inbox`)
    const data: ApiResponse<InboxMessage[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch messages')
    }

    return data.data
  },

  /**
   * 根据 ID 获取消息
   */
  async getById(id: string): Promise<InboxMessage> {
    const response = await fetch(`${API_BASE_URL}/inbox/${id}`)
    const data: ApiResponse<InboxMessage> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch message')
    }

    return data.data
  },

  /**
   * 根据类型获取消息
   */
  async getByType(type: MessageType): Promise<InboxMessage[]> {
    const response = await fetch(`${API_BASE_URL}/inbox?type=${type}`)
    const data: ApiResponse<InboxMessage[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch messages')
    }

    return data.data
  },

  /**
   * 根据团队 ID 获取消息
   */
  async getByTeam(teamId: string): Promise<InboxMessage[]> {
    const response = await fetch(`${API_BASE_URL}/inbox?teamId=${teamId}`)
    const data: ApiResponse<InboxMessage[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch messages')
    }

    return data.data
  },

  /**
   * 获取未读消息
   */
  async getUnread(): Promise<InboxMessage[]> {
    const response = await fetch(`${API_BASE_URL}/inbox?unread=true`)
    const data: ApiResponse<InboxMessage[]> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to fetch unread messages')
    }

    return data.data
  },

  /**
   * 标记消息为已读
   */
  async markAsRead(id: string): Promise<InboxMessage> {
    const response = await fetch(`${API_BASE_URL}/inbox/${id}/read`, {
      method: 'PATCH',
    })

    const data: ApiResponse<InboxMessage> = await response.json()

    if (!data.success || !data.data) {
      throw new Error(data.error || 'Failed to mark message as read')
    }

    return data.data
  },

  /**
   * 标记所有消息为已读
   */
  async markAllAsRead(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/inbox/read-all`, {
      method: 'PATCH',
    })

    const data: ApiResponse<void> = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to mark all messages as read')
    }
  },

  /**
   * 删除消息
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/inbox/${id}`, {
      method: 'DELETE',
    })

    const data: ApiResponse<void> = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to delete message')
    }
  },

  /**
   * 清空所有消息
   */
  async clearAll(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/inbox`, {
      method: 'DELETE',
    })

    const data: ApiResponse<void> = await response.json()

    if (!data.success) {
      throw new Error(data.error || 'Failed to clear messages')
    }
  },
}
