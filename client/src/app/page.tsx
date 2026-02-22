'use client'

import { useEffect, useState } from 'react'
import { SocketProvider, useSocketContext } from '@/components/providers/socket-provider'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { ChatPanel } from '@/components/chat/chat-panel'
import { TeamControlPanel } from '@/components/teams/team-control-panel'
import { Settings } from '@/components/settings/settings'
import { useInboxStore } from '@/lib/stores/inbox-store'
import { MessageSquare, Users, Settings as SettingsIcon } from 'lucide-react'

// Tab type
type TabType = 'messages' | 'control-panel' | 'settings'

const TABS = [
  { id: 'messages' as TabType, icon: MessageSquare, label: '消息' },
  { id: 'control-panel' as TabType, icon: Users, label: '控制面板' },
  { id: 'settings' as TabType, icon: SettingsIcon, label: '设置' },
]

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
        active
          ? 'bg-accent-primary text-white'
          : 'text-slate-400 hover:text-slate-200 hover:bg-background-tertiary'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

function AppContent() {
  const { isConnected } = useSocketContext()
  const [activeTab, setActiveTab] = useState<TabType>('messages')

  const selectTeam = useInboxStore((state) => state.selectTeam)

  // Demo: Select a default team after mount
  useEffect(() => {
    // Select first team for demo
    selectTeam('team-alpha')
  }, [selectTeam])

  const tabs = TABS

  return (
    <div className="h-screen flex flex-col bg-background-primary overflow-hidden">
      <Header
        isConnected={isConnected}
        onReconnect={() => window.location.reload()}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex-1 flex overflow-hidden min-h-0">
        {activeTab === 'messages' && (
          <>
            <Sidebar />
            <ChatPanel />
          </>
        )}
        {activeTab === 'control-panel' && <TeamControlPanel />}
        {activeTab === 'settings' && <Settings />}
      </div>
    </div>
  )
}

export default function Home() {
  // Use environment variable to determine demo mode
  // Defaults to true if not set
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false'
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002'

  return (
    <SocketProvider url={socketUrl} demoMode={demoMode}>
      <AppContent />
    </SocketProvider>
  )
}
