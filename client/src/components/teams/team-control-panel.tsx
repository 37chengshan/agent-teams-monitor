'use client'

import { useState, useMemo, useEffect, memo } from 'react'
import { useTeamsStore } from '@/lib/stores/teams-store'
import { useTasksStore } from '@/lib/stores/tasks-store'
import { useInboxStore } from '@/lib/stores/inbox-store'
import { useSocketContext } from '@/components/providers/socket-provider'
import { useSettingsStore } from '@/lib/stores/settings-store'
import { MemberStatus, TaskStatus } from '@/types'
import {
  Users,
  Activity,
  ListTodo,
  Settings,
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  Plus,
  Trash2,
  X,
  LayoutDashboard,
  Zap,
} from 'lucide-react'

type TabType = 'dashboard' | 'overview' | 'members' | 'tasks' | 'config'

const AnimatedNumber = memo(function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const duration = 800
    const startTime = Date.now()
    const startValue = displayValue

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / duration, 1)

      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValue + (value - startValue) * eased)

      setDisplayValue(current)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [value])

  return (
    <span className="tabular-nums">
      {displayValue}
      {suffix}
    </span>
  )
})

function DashboardTab({ isLight }: { isLight: boolean }) {
  const { teams, members } = useTeamsStore()
  const { tasks } = useTasksStore()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const globalStats = useMemo(() => {
    const activeTeams = teams.filter((team) => {
      const teamMembers = members.get(team.id) || []
      return teamMembers.some(
        (m) => m.status === MemberStatus.ACTIVE || m.status === MemberStatus.BUSY
      )
    })

    // Working members count
    let workingMembersCount = 0
    teams.forEach((team) => {
      const teamMembers = members.get(team.id) || []
      workingMembersCount += teamMembers.filter(
        (m) => m.status === MemberStatus.ACTIVE || m.status === MemberStatus.BUSY
      ).length
    })

    // Task stats
    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === TaskStatus.COMPLETED).length
    const pendingTasks = tasks.filter((t) => t.status === TaskStatus.PENDING).length
    const inProgressTasks = tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length

    return {
      totalTeams: teams.length,
      activeTeams: activeTeams.length,
      workingMembersCount,
      totalTasks,
      inProgressTasks,
      completedTasks,
      pendingTasks,
    }
  }, [teams, members, tasks])

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className="space-y-6">
      {/* Digital Clock */}
      <div className={`relative overflow-hidden rounded-2xl border p-6 ${
        isLight
          ? 'bg-gradient-to-br from-blue-50 via-white to-purple-50 border-gray-200'
          : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700/50'
      }`}>
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl ${
            isLight ? 'bg-blue-200/50' : 'bg-accent-primary/20'
          }`} />
          <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl ${
            isLight ? 'bg-purple-200/50' : 'bg-accent-info/20'
          }`} />
        </div>

        <div className="relative z-10">
          <div className={`flex items-center gap-2 text-sm mb-2 ${
            isLight ? 'text-gray-500' : 'text-slate-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span>当前时间</span>
          </div>
          <div className={`text-5xl font-mono font-bold tracking-wider ${
            isLight ? 'text-gray-900' : 'text-white'
          }`}>
            {formatTime(currentTime)}
          </div>
          <div className={`text-sm mt-1 ${
            isLight ? 'text-gray-400' : 'text-slate-500'
          }`}>
            {currentTime.toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            })}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Active Teams Card */}
        <div className={`relative overflow-hidden rounded-xl border p-4 ${
          isLight
            ? 'bg-gradient-to-br from-emerald-50 to-white border-emerald-200'
            : 'bg-gradient-to-br from-emerald-900/50 to-slate-900/50 border-emerald-500/30'
        }`}>
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl ${
            isLight ? 'bg-emerald-200/50' : 'bg-emerald-500/20'
          }`} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Zap className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span className={`text-xs ${isLight ? 'text-emerald-600/80' : 'text-emerald-400/80'}`}>工作中团队</span>
            </div>
            <div className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <AnimatedNumber value={globalStats.activeTeams} />
            </div>
          </div>
        </div>

        {/* Total Teams Card */}
        <div className={`relative overflow-hidden rounded-xl border p-4 ${
          isLight
            ? 'bg-gradient-to-br from-blue-50 to-white border-blue-200'
            : 'bg-gradient-to-br from-blue-900/50 to-slate-900/50 border-blue-500/30'
        }`}>
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl ${
            isLight ? 'bg-blue-200/50' : 'bg-blue-500/20'
          }`} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Users className={`w-4 h-4 ${isLight ? 'text-blue-600' : 'text-blue-400'}`} />
              <span className={`text-xs ${isLight ? 'text-blue-600/80' : 'text-blue-400/80'}`}>历史团队</span>
            </div>
            <div className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <AnimatedNumber value={globalStats.totalTeams} />
            </div>
          </div>
        </div>

        {/* Working Members Card */}
        <div className={`relative overflow-hidden rounded-xl border p-4 ${
          isLight
            ? 'bg-gradient-to-br from-violet-50 to-white border-violet-200'
            : 'bg-gradient-to-br from-violet-900/50 to-slate-900/50 border-violet-500/30'
        }`}>
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl ${
            isLight ? 'bg-violet-200/50' : 'bg-violet-500/20'
          }`} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Activity className={`w-4 h-4 ${isLight ? 'text-violet-600' : 'text-violet-400'}`} />
              <span className={`text-xs ${isLight ? 'text-violet-600/80' : 'text-violet-400/80'}`}>工作中成员</span>
            </div>
            <div className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <AnimatedNumber value={globalStats.workingMembersCount} />
            </div>
          </div>
        </div>

        {/* Total Tasks Card */}
        <div className={`relative overflow-hidden rounded-xl border p-4 ${
          isLight
            ? 'bg-gradient-to-br from-amber-50 to-white border-amber-200'
            : 'bg-gradient-to-br from-amber-900/50 to-slate-900/50 border-amber-500/30'
        }`}>
          <div className={`absolute -top-8 -right-8 w-24 h-24 rounded-full blur-2xl ${
            isLight ? 'bg-amber-200/50' : 'bg-amber-500/20'
          }`} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <ListTodo className={`w-4 h-4 ${isLight ? 'text-amber-600' : 'text-amber-400'}`} />
              <span className={`text-xs ${isLight ? 'text-amber-600/80' : 'text-amber-400/80'}`}>总任务数</span>
            </div>
            <div className={`text-3xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
              <AnimatedNumber value={globalStats.totalTasks} />
            </div>
          </div>
        </div>
      </div>

      {/* Task Progress Section */}
      <div className={`relative overflow-hidden rounded-xl border p-4 ${
        isLight
          ? 'bg-white border-gray-200'
          : 'bg-slate-900/80 border-slate-700/50'
      }`}>
        <h3 className={`text-sm font-medium mb-4 ${
          isLight ? 'text-gray-700' : 'text-slate-300'
        }`}>任务进度</h3>

        <div className="space-y-3">
          {/* Progress bar */}
          <div className={`h-2 rounded-full overflow-hidden ${
            isLight ? 'bg-gray-100' : 'bg-slate-800'
          }`}>
            <div className="h-full flex">
              {globalStats.totalTasks > 0 && (
                <>
                  <div
                    className="h-full bg-accent-success transition-all duration-500"
                    style={{
                      width: `${(globalStats.completedTasks / globalStats.totalTasks) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-accent-info transition-all duration-500"
                    style={{
                      width: `${(globalStats.inProgressTasks / globalStats.totalTasks) * 100}%`,
                    }}
                  />
                  <div
                    className="h-full bg-accent-warning transition-all duration-500"
                    style={{
                      width: `${(globalStats.pendingTasks / globalStats.totalTasks) * 100}%`,
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-success" />
              <span className={isLight ? 'text-gray-500' : 'text-slate-400'}>
                已完成 <span className={isLight ? 'text-gray-800 font-medium' : 'text-white font-medium'}>{globalStats.completedTasks}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-info" />
              <span className={isLight ? 'text-gray-500' : 'text-slate-400'}>
                进行中 <span className={isLight ? 'text-gray-800 font-medium' : 'text-white font-medium'}>{globalStats.inProgressTasks}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-accent-warning" />
              <span className={isLight ? 'text-gray-500' : 'text-slate-400'}>
                待处理 <span className={isLight ? 'text-gray-800 font-medium' : 'text-white font-medium'}>{globalStats.pendingTasks}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Overview Tab
function OverviewTab({ isLight }: { isLight: boolean }) {
  const { teams, members } = useTeamsStore()
  const { tasks } = useTasksStore()
  const { selectedTeamId } = useInboxStore()

  const teamMembers = useMemo(() => {
    if (!selectedTeamId) return []
    return members.get(selectedTeamId) || []
  }, [selectedTeamId, members])

  const teamTasks = useMemo(() => {
    if (!selectedTeamId) return []
    return tasks.filter((t) => t.teamId === selectedTeamId)
  }, [selectedTeamId, tasks])

  const stats = useMemo(() => {
    const onlineCount = teamMembers.filter(
      (m) => m.status === MemberStatus.ACTIVE || m.status === MemberStatus.BUSY
    ).length
    const offlineCount = teamMembers.filter(
      (m) => m.status === MemberStatus.OFFLINE
    ).length
    const pendingTasks = teamTasks.filter((t) => t.status === TaskStatus.PENDING).length
    const inProgressTasks = teamTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length
    const completedTasks = teamTasks.filter((t) => t.status === TaskStatus.COMPLETED).length

    return {
      totalMembers: teamMembers.length,
      onlineCount,
      offlineCount,
      pendingTasks,
      inProgressTasks,
      completedTasks,
    }
  }, [teamMembers, teamTasks])

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  return (
    <div className="space-y-6">
      {/* Team Info */}
      <div className="bg-background-secondary rounded-lg p-4 border border-slate-700">
        <h3 className="text-lg font-medium text-slate-200 mb-2">
          {selectedTeam?.name || '未选择团队'}
        </h3>
        <p className="text-sm text-slate-400">
          创建时间:{' '}
          {selectedTeam?.createdAt
            ? new Date(selectedTeam.createdAt).toLocaleDateString('zh-CN')
            : '-'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Member Stats */}
        <div className="bg-background-secondary rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-accent-primary" />
            <span className="text-sm font-medium text-slate-300">成员统计</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">总人数</span>
              <span className="text-slate-200">{stats.totalMembers}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">在线</span>
              <span className="text-accent-success">{stats.onlineCount}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">离线</span>
              <span className="text-slate-400">{stats.offlineCount}</span>
            </div>
          </div>
        </div>

        {/* Task Stats */}
        <div className="bg-background-secondary rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3">
            <ListTodo className="w-4 h-4 text-accent-primary" />
            <span className="text-sm font-medium text-slate-300">任务统计</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">待处理</span>
              <span className="text-accent-warning">{stats.pendingTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">进行中</span>
              <span className="text-accent-info">{stats.inProgressTasks}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">已完成</span>
              <span className="text-accent-success">{stats.completedTasks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Members Tab
function MembersTab({ isLight }: { isLight: boolean }) {
  const { members, updateMemberStatus } = useTeamsStore()
  const { selectedTeamId } = useInboxStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<MemberStatus | 'all'>('all')

  const teamMembers = useMemo(() => {
    if (!selectedTeamId) return []
    let result = members.get(selectedTeamId) || []

    // Filter by search
    if (searchQuery) {
      result = result.filter((m) =>
        String(m.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((m) => m.status === statusFilter)
    }

    return result
  }, [selectedTeamId, members, searchQuery, statusFilter])

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: MemberStatus.ACTIVE, label: '工作中' },
    { value: MemberStatus.IDLE, label: '空闲' },
    { value: MemberStatus.BUSY, label: '忙碌' },
    { value: MemberStatus.OFFLINE, label: '离线' },
  ]

  const statusColors = {
    [MemberStatus.ACTIVE]: 'bg-accent-success',
    [MemberStatus.IDLE]: 'bg-accent-warning',
    [MemberStatus.OFFLINE]: 'bg-slate-500',
    [MemberStatus.BUSY]: 'bg-accent-info',
  }

  const cycleStatus = (currentStatus: MemberStatus) => {
    if (!selectedTeamId) return
    const statuses = [
      MemberStatus.ACTIVE,
      MemberStatus.IDLE,
      MemberStatus.BUSY,
      MemberStatus.OFFLINE,
    ]
    const currentIndex = statuses.indexOf(currentStatus)
    const nextStatus = statuses[(currentIndex + 1) % statuses.length]
    updateMemberStatus(selectedTeamId, '', nextStatus)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜索成员..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background-secondary border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-400 focus:border-accent-primary focus:outline-none"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as MemberStatus | 'all')}
          className="px-3 py-2 bg-background-secondary border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-accent-primary focus:outline-none"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Member List */}
      <div className="space-y-2">
        {teamMembers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">暂无成员</div>
        ) : (
          teamMembers.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-3 bg-background-secondary rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
            >
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                  style={{ backgroundColor: member.color || '#8B5CF6' }}
                >
                  {String(member.name || '').charAt(0).toUpperCase()}
                </div>
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-background-secondary ${
                    statusColors[member.status]
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-200">{String(member.name || '')}</span>
                  {member.role === 'leader' && (
                    <span className="text-xs text-accent-primary">负责人</span>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  {member.status === MemberStatus.ACTIVE && '工作中'}
                  {member.status === MemberStatus.IDLE && '空闲'}
                  {member.status === MemberStatus.BUSY && '忙碌'}
                  {member.status === MemberStatus.OFFLINE && '离线'}
                </span>
              </div>
              <button
                onClick={() => cycleStatus(member.status)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                title="切换状态"
              >
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// Tasks Tab
function TasksTab({ isLight }: { isLight: boolean }) {
  const { tasks, updateTask } = useTasksStore()
  const { selectedTeamId } = useInboxStore()
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [ownerFilter, setOwnerFilter] = useState<string>('all')

  const teamTasks = useMemo(() => {
    if (!selectedTeamId) return []
    let result = tasks.filter((t) => t.teamId === selectedTeamId)

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter)
    }

    // Filter by owner
    if (ownerFilter !== 'all') {
      result = result.filter((t) => t.owner === ownerFilter)
    }

    return result
  }, [selectedTeamId, tasks, statusFilter, ownerFilter])

  const owners = useMemo(() => {
    if (!selectedTeamId) return []
    const teamTasks = tasks.filter((t) => t.teamId === selectedTeamId)
    const ownerSet = new Set(teamTasks.map((t) => t.owner).filter(Boolean))
    return ['all', ...Array.from(ownerSet)]
  }, [selectedTeamId, tasks])

  const statusOptions = [
    { value: 'all', label: '全部' },
    { value: TaskStatus.PENDING, label: '待处理' },
    { value: TaskStatus.IN_PROGRESS, label: '进行中' },
    { value: TaskStatus.BLOCKED, label: '阻塞' },
    { value: TaskStatus.COMPLETED, label: '已完成' },
  ]

  const statusConfig = {
    [TaskStatus.PENDING]: { icon: Clock, color: 'text-accent-warning', bg: 'bg-accent-warning/10' },
    [TaskStatus.IN_PROGRESS]: { icon: Activity, color: 'text-accent-info', bg: 'bg-accent-info/10' },
    [TaskStatus.BLOCKED]: { icon: AlertCircle, color: 'text-accent-error', bg: 'bg-accent-error/10' },
    [TaskStatus.COMPLETED]: { icon: CheckCircle2, color: 'text-accent-success', bg: 'bg-accent-success/10' },
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'all')}
          className="flex-1 px-3 py-2 bg-background-secondary border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-accent-primary focus:outline-none"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={ownerFilter}
          onChange={(e) => setOwnerFilter(e.target.value)}
          className="flex-1 px-3 py-2 bg-background-secondary border border-slate-700 rounded-lg text-sm text-slate-200 focus:border-accent-primary focus:outline-none"
        >
          {owners.map((owner) => (
            <option key={owner} value={owner}>
              {owner === 'all' ? '全部负责人' : owner}
            </option>
          ))}
        </select>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {teamTasks.length === 0 ? (
          <div className="text-center py-8 text-slate-400">暂无任务</div>
        ) : (
          teamTasks.map((task) => {
            const config = statusConfig[task.status]
            return (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 bg-background-secondary rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              >
                <div className={`p-1.5 rounded ${config.bg}`}>
                  <config.icon className={`w-4 h-4 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-200">{task.subject}</div>
                  <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {task.description}
                  </div>
                  {task.owner && (
                    <div className="text-xs text-slate-500 mt-2">负责人: {task.owner}</div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// Config Tab
function ConfigTab({ isLight }: { isLight: boolean }) {
  const { teams } = useTeamsStore()
  const { selectedTeamId, selectTeam } = useInboxStore()
  const { emit } = useSocketContext()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingPrompts, setEditingPrompts] = useState<Record<string, string>>({})
  const [isEditingPrompts, setIsEditingPrompts] = useState(false)

  const selectedTeam = teams.find((t) => t.id === selectedTeamId)

  // Initialize editingPrompts when team changes
  useEffect(() => {
    if (selectedTeam?.config?.agentPrompts) {
      setEditingPrompts(selectedTeam.config.agentPrompts)
    } else {
      // Initialize with empty prompts for each member
      const memberNames = selectedTeam?.members?.map(m =>
        typeof m === 'string' ? m : m.name
      ) || []
      const emptyPrompts: Record<string, string> = {}
      memberNames.forEach(name => {
        if (name) emptyPrompts[name] = ''
      })
      setEditingPrompts(emptyPrompts)
    }
  }, [selectedTeam?.id])

  const handleCreateTeam = (name: string, members: string[]) => {
    const teamId = name.toLowerCase().replace(/\s+/g, '-')
    emit('team:create', { teamId, name, members })
    setShowCreateModal(false)
  }

  const handleUpdateTeam = (name: string, members: string[]) => {
    if (!selectedTeamId) return
    emit('team:update', { teamId: selectedTeamId, name, members })
    setShowEditModal(false)
  }

  const handleSavePrompts = () => {
    if (!selectedTeamId) return
    emit('team:update', {
      teamId: selectedTeamId,
      name: selectedTeam?.name,
      members: selectedTeam?.members?.map(m => typeof m === 'string' ? m : m.name) || [],
      agentPrompts: editingPrompts
    })
    setIsEditingPrompts(false)
  }

  const handleDeleteTeam = () => {
    if (!selectedTeamId) return
    emit('team:delete', { teamId: selectedTeamId })
    setShowDeleteConfirm(false)
  }

  if (!selectedTeam) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-slate-300">团队配置</h3>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent-primary text-white text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            创建团队
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            暂无团队，请创建一个新团队
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-slate-400 mb-4">选择一个团队查看详情</p>
            {teams.map((team) => (
              <div
                key={team.id}
                onClick={() => selectTeam(team.id)}
                className="p-3 bg-background-secondary rounded-lg border border-slate-700 cursor-pointer hover:border-accent-primary transition-colors"
              >
                <div className="font-medium text-slate-200">{team.name}</div>
                <div className="text-xs text-slate-500">{team.id}</div>
              </div>
            ))}
          </div>
        )}

        {showCreateModal && (
          <TeamModal
            onClose={() => setShowCreateModal(false)}
            onSubmit={handleCreateTeam}
            title="创建团队"
          />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Back button when team is selected */}
      {selectedTeam && (
        <button
          onClick={() => useInboxStore.getState().selectTeam(null)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-2"
        >
          ← 返回团队列表
        </button>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-slate-300">
            {selectedTeam ? `团队详情: ${selectedTeam.name}` : '团队配置'}
          </h3>
          <span className="text-xs text-slate-500 bg-background-secondary px-2 py-0.5 rounded">
            共 {teams.length} 个团队
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent-primary text-white text-sm rounded-lg hover:bg-accent-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-background-tertiary text-slate-200 text-sm rounded-lg hover:bg-slate-600 transition-colors"
          >
            编辑
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-accent-error/20 text-accent-error text-sm rounded-lg hover:bg-accent-error/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            删除
          </button>
        </div>
      </div>

      <div className="bg-background-secondary rounded-lg p-4 border border-slate-700">
        <h3 className="text-sm font-medium text-slate-300 mb-4">团队基本信息</h3>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">团队名称</span>
            <span className="text-slate-200">{selectedTeam.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">团队ID</span>
            <span className="text-slate-200 font-mono text-xs">{selectedTeam.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">成员数量</span>
            <span className="text-slate-200">{selectedTeam.members?.length || 0}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">创建时间</span>
            <span className="text-slate-200">
              {selectedTeam.createdAt
                ? new Date(selectedTeam.createdAt).toLocaleString('zh-CN')
                : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Members List */}
      {selectedTeam.members && selectedTeam.members.length > 0 && (
        <div className="bg-background-secondary rounded-lg p-4 border border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-4">成员列表</h3>
          <div className="space-y-2">
            {selectedTeam.members.map((member, index) => {
              // Defensive: ensure we have valid member data
              let memberName = ''
              let memberId = ''
              let memberRole = 'member'
              let memberColor = '#8B5CF6'

              try {
                if (typeof member === 'string') {
                  memberName = String(member)
                  memberId = `${selectedTeam.id}-${memberName}-${index}`
                } else if (member && typeof member === 'object') {
                  memberName = String(member.name || '')
                  memberId = String(member.id || `${selectedTeam.id}-${memberName}-${index}`)
                  memberRole = String(member.role || 'member')
                  memberColor = String(member.color || '#8B5CF6')
                }
              } catch (e) {
                // Skip invalid members
                return null
              }

              if (!memberName || typeof memberName.charAt !== 'function') {
                return null
              }

              return (
                <div key={memberId} className="flex items-center gap-3 p-2">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                    style={{ backgroundColor: memberColor }}
                  >
                    {memberName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm text-slate-200">{memberName}</div>
                    <div className="text-xs text-slate-500">{memberRole}</div>
                  </div>
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>
      )}

      {/* Agent Prompts Editor */}
      {selectedTeam && (
        <div className="bg-background-secondary rounded-lg p-4 border border-slate-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-slate-300">Agent 提示词配置</h3>
            {!isEditingPrompts ? (
              <button
                onClick={() => setIsEditingPrompts(true)}
                className="text-xs text-accent-primary hover:text-accent-primary/80"
              >
                编辑
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditingPrompts(false)}
                  className="text-xs text-slate-400 hover:text-slate-300"
                >
                  取消
                </button>
                <button
                  onClick={handleSavePrompts}
                  className="text-xs text-accent-success hover:text-accent-success/80"
                >
                  保存
                </button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {Object.keys(editingPrompts).length === 0 ? (
              <p className="text-xs text-slate-500">暂无成员，请先添加团队成员</p>
            ) : (
              Object.entries(editingPrompts).map(([agentName, prompt]) => (
                <div key={agentName} className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">{agentName}</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setEditingPrompts(prev => ({
                      ...prev,
                      [agentName]: e.target.value
                    }))}
                    disabled={!isEditingPrompts}
                    placeholder={`输入 ${agentName} 的系统提示词...`}
                    className="w-full px-3 py-2 bg-background-tertiary border border-slate-600 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:border-accent-primary focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {showCreateModal && (
        <TeamModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateTeam}
          title="创建团队"
        />
      )}

      {showEditModal && selectedTeam && (
        <TeamModal
          initialName={selectedTeam.name}
          initialMembers={selectedTeam.members?.map(m => typeof m === 'string' ? m : m.name) || []}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateTeam}
          title="编辑团队"
        />
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background-secondary rounded-lg p-6 border border-slate-700 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-slate-200 mb-4">确认删除</h3>
            <p className="text-sm text-slate-400 mb-6">
              确定要删除团队 "{selectedTeam?.name}" 吗？此操作不可恢复。
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm text-slate-300 hover:bg-background-tertiary rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleDeleteTeam}
                className="px-4 py-2 text-sm bg-accent-error text-white rounded-lg hover:bg-accent-error/90 transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Team Modal Component
function TeamModal({
  initialName = '',
  initialMembers = [],
  onClose,
  onSubmit,
  title,
}: {
  initialName?: string
  initialMembers?: string[]
  onClose: () => void
  onSubmit: (name: string, members: string[]) => void
  title: string
}) {
  const [name, setName] = useState(initialName)
  const [membersInput, setMembersInput] = useState(initialMembers.join(', '))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const members = membersInput
      .split(',')
      .map((m) => m.trim())
      .filter((m) => m.length > 0)

    onSubmit(name.trim(), members)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background-secondary rounded-lg p-6 border border-slate-700 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-slate-200">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-400 mb-2">团队名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入团队名称"
              className="w-full px-3 py-2 bg-background-tertiary border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:border-accent-primary focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-2">
              成员 (用逗号分隔)
            </label>
            <input
              type="text"
              value={membersInput}
              onChange={(e) => setMembersInput(e.target.value)}
              placeholder="planner, researcher, coder"
              className="w-full px-3 py-2 bg-background-tertiary border border-slate-600 rounded-lg text-slate-200 placeholder-slate-500 focus:border-accent-primary focus:outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">
              例如: planner, code-reviewer, researcher
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-300 hover:bg-background-tertiary rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors"
            >
              确定
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Tab Button Component
function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
  isLight,
}: {
  active: boolean
  onClick: () => void
  icon: React.ElementType
  label: string
  isLight: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/25'
          : isLight
            ? 'text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:scale-105 active:scale-95'
            : 'text-slate-400 hover:text-slate-200 hover:bg-background-tertiary hover:scale-105 active:scale-95'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}

export function TeamControlPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const theme = useSettingsStore((state) => state.theme)
  const isLight = theme === 'light'

  const tabs = [
    { id: 'dashboard' as TabType, icon: LayoutDashboard, label: '仪表盘' },
    { id: 'overview' as TabType, icon: Activity, label: '概览' },
    { id: 'members' as TabType, icon: Users, label: '成员' },
    { id: 'tasks' as TabType, icon: ListTodo, label: '任务' },
    { id: 'config' as TabType, icon: Settings, label: '配置' },
  ]

  return (
    <div className={`h-full flex flex-col w-full min-w-0 ${
      isLight ? 'bg-gray-50' : 'bg-background-primary'
    }`}>
      {/* Tab Navigation */}
      <div className={`flex gap-2 p-4 border-b shrink-0 overflow-x-auto ${
        isLight ? 'border-gray-200 bg-white' : 'border-slate-700 bg-background-secondary'
      }`}>
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            active={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            icon={tab.icon}
            label={tab.label}
            isLight={isLight}
          />
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 min-w-0">
        <div
          key={activeTab}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
        >
          {activeTab === 'dashboard' && <DashboardTab isLight={isLight} />}
          {activeTab === 'overview' && <OverviewTab isLight={isLight} />}
          {activeTab === 'members' && <MembersTab isLight={isLight} />}
          {activeTab === 'tasks' && <TasksTab isLight={isLight} />}
          {activeTab === 'config' && <ConfigTab isLight={isLight} />}
        </div>
      </div>
    </div>
  )
}
