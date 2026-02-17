/**
 * useInbox - 消息数据管理 Hook
 */

import { useEffect } from 'react'
import { socketClient } from '@/lib/socket'
import { useInboxStore } from '@/lib/stores'
import type { InboxMessage } from '@/lib/types/inbox'

export function useInbox() {
  const {
    messages,
    loading,
    error,
    setMessages,
    addMessage,
    markAsRead,
    markAllAsRead,
    removeMessage,
    setLoading,
  } = useInboxStore()

  useEffect(() => {
    // 监听全部消息更新事件（服务器发送初始数据时使用）
    const handleInboxUpdated = (updatedMessages: InboxMessage[]) => {
      console.log('[useInbox] Inbox updated:', updatedMessages.length)
      setMessages(updatedMessages)
      setLoading(false)
    }

    // 监听单条新��息事件
    const handleNewMessage = (data: { message: InboxMessage; timestamp: number }) => {
      console.log('[useInbox] New message:', data.message.id)
      addMessage(data.message)
    }

    // 注册事件监听
    socketClient.on('inbox:updated', handleInboxUpdated)
    socketClient.on('inbox:message', handleNewMessage)

    // 初始加载数据
    if (socketClient.isConnected()) {
      console.log('[useInbox] Fetching initial messages')
      socketClient.fetchInbox()
    } else {
      // 等待连接建立后获取数据
      const checkConnection = setInterval(() => {
        if (socketClient.isConnected()) {
          clearInterval(checkConnection)
          console.log('[useInbox] Connection ready, fetching messages')
          socketClient.fetchInbox()
        }
      }, 100)

      return () => {
        clearInterval(checkConnection)
        socketClient.off('inbox:updated', handleInboxUpdated)
        socketClient.off('inbox:message', handleNewMessage)
      }
    }

    // 清理函数
    return () => {
      socketClient.off('inbox:updated', handleInboxUpdated)
      socketClient.off('inbox:message', handleNewMessage)
    }
  }, [setMessages, addMessage, setLoading])

  /**
   * 获取消息数据
   */
  const fetchMessages = () => {
    setLoading(true)
    socketClient.fetchInbox()
  }

  return {
    messages,
    loading,
    error,
    fetchMessages,
    markAsRead,
    markAllAsRead,
    removeMessage,
  }
}
