'use client'

import { useState, useRef, useEffect, memo, useCallback } from 'react'
import { Settings, ChevronDown, MessageSquare, Users, Sun, Moon } from 'lucide-react'
import { ConnectionStatus } from '@/components/providers/connection-status'
import { useInboxStore } from '@/lib/stores/inbox-store'
import { useTeamsStore } from '@/lib/stores/teams-store'
import { useSettingsStore } from '@/lib/stores/settings-store'

interface HeaderProps {
  isConnected: boolean
  onReconnect?: () => void
  activeTab?: 'messages' | 'control-panel' | 'settings'
  onTabChange?: (tab: 'messages' | 'control-panel' | 'settings') => void
}

const tabs = [
  { id: 'messages' as const, icon: MessageSquare, label: '消息' },
  { id: 'control-panel' as const, icon: Users, label: '控制面板' },
]

export const Header = memo(function Header({ isConnected, onReconnect, activeTab = 'messages', onTabChange }: HeaderProps) {
  const { selectedTeamId, selectTeam } = useInboxStore()
  const { teams } = useTeamsStore()
  const { theme, setTheme } = useSettingsStore()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleTeamSelect = useCallback((teamId: string) => {
    selectTeam(teamId)
    setIsDropdownOpen(false)
  }, [selectTeam])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const isLight = theme === 'light'

  return (
    <header className={`h-14 border-b flex items-center justify-between px-4 transition-colors ${
      isLight
        ? 'bg-white border-gray-200'
        : 'bg-background-secondary border-slate-700'
    }`}>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AT</span>
          </div>
          <span className={`font-display font-semibold text-lg ${isLight ? 'text-gray-900' : 'text-white'}`}>Agent Teams</span>
        </div>

        <div className="flex items-center gap-1 ml-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? isLight
                    ? 'bg-primary/10 text-primary'
                    : 'bg-accent-primary/20 text-accent-primary'
                  : isLight
                    ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-background-tertiary'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <ConnectionStatus
          isConnected={isConnected}
          onReconnect={onReconnect}
        />
      </div>

      <div className="flex items-center gap-2">
        {activeTab === 'messages' && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer ${
                isLight
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-background-tertiary hover:bg-slate-600 text-slate-200'
              }`}
            >
              <span>
                {teams.find((t) => t.id === selectedTeamId)?.name || '选择团队'}
              </span>
              <ChevronDown className={`w-4 h-4 ${isLight ? 'text-gray-500' : 'text-slate-400'}`} />
            </button>

            {isDropdownOpen && (
              <div className={`absolute right-0 mt-1 w-40 rounded-lg shadow-lg z-50 border ${
                isLight
                  ? 'bg-white border-gray-200'
                  : 'bg-background-tertiary border-slate-600'
              }`}>
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleTeamSelect(team.id)}
                    className={`w-full px-3 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg cursor-pointer ${
                      team.id === selectedTeamId
                        ? isLight ? 'text-primary bg-primary/5' : 'text-accent-primary'
                        : isLight
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-slate-200 hover:bg-slate-600'
                    }`}
                  >
                    {team.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            isLight
              ? 'hover:bg-gray-100 text-gray-600'
              : 'hover:bg-background-tertiary text-slate-400'
          }`}
          title={isLight ? '切换到深色模式' : '切换到浅色模式'}
        >
          {isLight ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        <button
          onClick={() => onTabChange?.('settings')}
          className={`p-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'settings'
              ? isLight
                ? 'bg-primary/10 text-primary'
                : 'bg-accent-primary/20 text-accent-primary'
              : isLight
                ? 'hover:bg-gray-100 text-gray-600'
                : 'hover:bg-background-tertiary text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
})
