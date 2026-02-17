/**
 * Inbox Store - 消息数据状态管理
 */

import { create } from 'zustand'
import type { InboxMessage, MessageType } from '@/lib/types/inbox'

interface InboxStore {
  // 状态
  messages: InboxMessage[]
  loading: boolean
  error: string | null

  // Actions
  setMessages: (messages: InboxMessage[]) => void
  addMessage: (message: InboxMessage) => void
  markAsRead: (messageId: string) => void
  markAllAsRead: () => void
  removeMessage: (messageId: string) => void
  clearMessages: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void

  // Selectors
  getMessagesByType: (type: MessageType) => InboxMessage[]
  getUnreadCount: () => number
  getMessagesByTeam: (teamId: string) => InboxMessage[]
}

export const useInboxStore = create<InboxStore>((set, get) => ({
  // 初始状态
  messages: [],
  loading: false,
  error: null,

  // 设置所有消息
  setMessages: (messages) => set({ messages }),

  // 添加新消息 (不可变更新)
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  // 标记为已读 (不可变更新)
  markAsRead: (messageId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ),
    })),

  // 标记所有消息为已读 (不可变更新)
  markAllAsRead: () =>
    set((state) => ({
      messages: state.messages.map((msg) => ({ ...msg, read: true })),
    })),

  // 删除消息 (不可变更新)
  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),

  // 清空所有消息
  clearMessages: () => set({ messages: [] }),

  // 设置加载状态
  setLoading: (loading) => set({ loading }),

  // 设置错误状态
  setError: (error) => set({ error }),

  // 根据类型获取消息
  getMessagesByType: (type) => {
    const state = get()
    return state.messages.filter((msg) => msg.type === type)
  },

  // 获取未读消息数量
  getUnreadCount: () => {
    const state = get()
    return state.messages.filter((msg) => !msg.read).length
  },

  // 根据团队 ID 获取消息
  getMessagesByTeam: (teamId) => {
    const state = get()
    return state.messages.filter((msg) => msg.teamId === teamId)
  },
}))
