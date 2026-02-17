'use client'

/**
 * Sidebar - 侧边栏导航组件
 */

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Users, CheckSquare, Inbox } from 'lucide-react'
import { useState } from 'react'
import { useTeamStore } from '@/lib/stores/team-store'
import { useTaskStore } from '@/lib/stores/task-store'
import { useInboxStore } from '@/lib/stores/inbox-store'
import { useRouter, usePathname } from 'next/navigation'

type TabValue = 'teams' | 'tasks' | 'inbox'

export function Sidebar() {
  const router = useRouter()
  const pathname = usePathname()

  // 从路径推断当前 tab
  const getActiveTab = (): TabValue => {
    if (pathname.includes('/tasks')) {
      return 'tasks'
    } else if (pathname.includes('/inbox')) {
      return 'inbox'
    }
    return 'teams'
  }

  const [activeTab, setActiveTab] = useState<TabValue>(getActiveTab())
  const teams = useTeamStore((state) => state.teams)
  const tasks = useTaskStore((state) => state.tasks)
  const messages = useInboxStore((state) => state.messages)

  // 计算未读消息数
  const unreadCount = messages.filter((m) => !m.read).length

  const handleTabChange = (value: string) => {
    const tabValue = value as TabValue
    setActiveTab(tabValue)
    router.push(`/${tabValue}`)
  }

  const tabs = [
    {
      value: 'teams',
      label: '团队',
      icon: Users,
      count: teams.length,
    },
    {
      value: 'tasks',
      label: '任务',
      icon: CheckSquare,
      count: tasks.filter((t) => t.status === 'in_progress').length,
    },
    {
      value: 'inbox',
      label: '消息',
      icon: Inbox,
      count: unreadCount,
    },
  ]

  return (
    <aside className="w-64 border-r bg-muted/40">
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <div className="p-4 space-y-4">
          {/* 导航标签 */}
          <Tabs value={activeTab} onValueChange={handleTabChange} orientation="vertical">
            <TabsList className="grid w-full grid-cols-1 bg-transparent p-0">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="relative justify-start gap-3 px-3 py-2.5 data-[state=active]:bg-muted"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.count > 0 && (
                      <Badge variant="secondary" className="h-5 min-w-5 px-1 text-xs">
                        {tab.count}
                      </Badge>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>

          {/* 统计信息 */}
          <div className="pt-4 border-t space-y-2">
            <div className="text-sm font-medium text-muted-foreground">统计</div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">团队总数</span>
                <span className="font-medium">{teams.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">任务总数</span>
                <span className="font-medium">{tasks.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">消息总数</span>
                <span className="font-medium">{messages.length}</span>
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}
