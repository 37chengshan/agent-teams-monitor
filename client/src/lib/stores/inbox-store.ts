'use client'

import { create } from 'zustand'
import { InboxMessage, Conversation, MessageFilters, MemberStatus, Member } from '@/types'

interface InboxState {
  messages: InboxMessage[]
  conversations: Conversation[]
  filteredMessages: InboxMessage[]
  teamMembers: Member[]

  selectedConversationId: string | null
  selectedMessageId: string | null
  selectedTeamId: string | null

  filters: MessageFilters

  isLoading: boolean
  error: string | null
  autoScroll: boolean
  showRawJson: string | null
}

interface InboxActions {
  addMessage: (message: InboxMessage) => void
  setMessages: (messages: InboxMessage[]) => void
  updateMessage: (id: string, updates: Partial<InboxMessage>) => void
  deleteMessage: (id: string) => void
  toggleRead: (id: string) => void

  setConversations: (conversations: Conversation[]) => void
  setTeamMembers: (members: Member[]) => void
  selectConversation: (id: string | null) => void
  selectMessage: (id: string | null) => void
  selectTeam: (teamId: string | null) => void

  setFilters: (filters: MessageFilters) => void
  updateFilters: (updates: Partial<MessageFilters>) => void
  clearFilters: () => void
  applyFilters: () => void

  setAutoScroll: (value: boolean) => void
  setShowRawJson: (messageId: string | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  clear: () => void
}

const defaultFilters: MessageFilters = {
  type: 'all',
  status: 'all',
}

export const useInboxStore = create<InboxState & InboxActions>((set, get) => ({
  messages: [],
  conversations: [],
  filteredMessages: [],
  teamMembers: [],
  selectedConversationId: null,
  selectedMessageId: null,
  selectedTeamId: null,
  filters: defaultFilters,
  isLoading: false,
  error: null,
  autoScroll: true,
  showRawJson: null,

  // Message actions
  addMessage: (message) => {
    set((state) => {
      const newMessages = [...state.messages, message]
      // Update conversations
      const conversations = updateConversationsFromMessages(
        state.conversations,
        newMessages,
        state.selectedTeamId
      )
      return {
        messages: newMessages,
        conversations,
      }
    })
    get().applyFilters()
  },

  setMessages: (messages) => {
    set((state) => {
      const conversations = updateConversationsFromMessages(
        state.conversations,
        messages,
        state.selectedTeamId
      )
      return { messages, conversations }
    })
    get().applyFilters()
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }))
    get().applyFilters()
  },

  deleteMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((m) => m.id !== id),
    }))
    get().applyFilters()
  },

  toggleRead: (id) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === id ? { ...m, read: !m.read } : m
      ),
    }))
  },

  // Conversation actions
  setConversations: (conversations) => set({ conversations }),
  setTeamMembers: (members) => set({ teamMembers: members }),

  selectConversation: (id) => {
    set({ selectedConversationId: id })
    get().applyFilters()
  },

  selectMessage: (id) => set({ selectedMessageId: id }),

  selectTeam: (teamId) => {
    set({ selectedTeamId: teamId, selectedConversationId: null })
    get().applyFilters()
  },

  // Filter actions
  setFilters: (filters) => {
    set({ filters })
    get().applyFilters()
  },

  updateFilters: (updates) => {
    set((state) => ({
      filters: { ...state.filters, ...updates },
    }))
    get().applyFilters()
  },

  clearFilters: () => {
    set({ filters: defaultFilters })
    get().applyFilters()
  },

  applyFilters: () => {
    const { messages, filters, selectedConversationId, selectedTeamId } = get()

    let filtered = [...messages]

    // Filter by selected conversation
    if (selectedConversationId) {
      // Conversation ID format: ${teamId}-${agentName}
      const agentName = selectedConversationId.replace(`${selectedTeamId}-`, '')
      filtered = filtered.filter((m) => m.from === agentName && m.teamId === selectedTeamId)
    }

    // Filter by team if no conversation selected
    if (!selectedConversationId && selectedTeamId) {
      filtered = filtered.filter((m) => m.teamId === selectedTeamId)
    }

    // Filter by sender
    if (filters.sender && filters.sender.length > 0) {
      filtered = filtered.filter((m) =>
        filters.sender!.includes(m.from)
      )
    }

    // Filter by type
    if (filters.type && filters.type !== 'all') {
      filtered = filtered.filter((m) => m.type === filters.type)
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((m) =>
        filters.status === 'read' ? m.read : !m.read
      )
    }

    // Filter by team
    if (filters.teamId) {
      filtered = filtered.filter((m) => m.teamId === filters.teamId)
    }

    // Filter by search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter((m) =>
        m.text.toLowerCase().includes(query) ||
        m.from.toLowerCase().includes(query)
      )
    }

    // Sort by timestamp
    filtered.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    set({ filteredMessages: filtered })
  },

  // UI actions
  setAutoScroll: (value) => set({ autoScroll: value }),
  setShowRawJson: (messageId) => set({ showRawJson: messageId }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clear: () =>
    set({
      messages: [],
      conversations: [],
      filteredMessages: [],
      selectedConversationId: null,
      selectedMessageId: null,
    }),
}))

// Helper function to update conversations from messages
function updateConversationsFromMessages(
  existing: Conversation[],
  messages: InboxMessage[],
  teamId: string | null
): Conversation[] {
  const agentMessages = teamId
    ? messages.filter((m) => m.teamId === teamId)
    : messages

  // Group by agent
  const byAgent = new Map<string, InboxMessage[]>()

  agentMessages.forEach((msg) => {
    const key = msg.from
    const existing = byAgent.get(key) || []
    byAgent.set(key, [...existing, msg])
  })

  // Convert to conversations
  const conversations: Conversation[] = []

  byAgent.forEach((msgs, agentName) => {
    const latest = msgs[0]
    const unreadCount = msgs.filter((m) => !m.read).length

    conversations.push({
      id: `${latest.teamId}-${agentName}`,
      teamId: latest.teamId,
      teamName: latest.teamId,
      agentName,
      agentColor: latest.color || '#8B5CF6',
      lastMessage: {
        text: latest.text.slice(0, 50),
        timestamp: latest.timestamp,
        type: latest.type === 'protocol' ? 'protocol' : 'assistant',
      },
      unreadCount,
      isOnline: true,
      status: MemberStatus.ACTIVE,
    })
  })

  // Sort by last message time
  conversations.sort((a, b) =>
    new Date(b.lastMessage.timestamp).getTime() -
    new Date(a.lastMessage.timestamp).getTime()
  )

  return conversations
}
