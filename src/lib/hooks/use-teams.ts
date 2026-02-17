/**
 * useTeams - 团队数据管理 Hook
 */

import { useEffect } from 'react'
import { socketClient } from '@/lib/socket'
import { useTeamStore } from '@/lib/stores'
import type { Team } from '@/lib/types/team'

export function useTeams() {
  const { teams, loading, error, setTeams, addTeam, updateTeam, removeTeam, setLoading } =
    useTeamStore()

  useEffect(() => {
    // 监听团队更新事件
    const handleTeamsUpdated = (updatedTeams: Team[]) => {
      console.log('[useTeams] Teams updated:', updatedTeams.length)
      setTeams(updatedTeams)
      setLoading(false)
    }

    const handleTeamCreated = (data: { team: Team; timestamp: number }) => {
      console.log('[useTeams] Team created:', data.team.id)
      addTeam(data.team)
    }

    const handleTeamUpdated = (data: { team: Team; timestamp: number }) => {
      console.log('[useTeams] Team updated:', data.team.id)
      updateTeam(data.team)
    }

    const handleTeamDeleted = (data: { teamId: string; timestamp: number }) => {
      console.log('[useTeams] Team deleted:', data.teamId)
      removeTeam(data.teamId)
    }

    // 注册事件监听
    socketClient.on('teams:updated', handleTeamsUpdated)
    socketClient.on('team:created', handleTeamCreated)
    socketClient.on('team:updated', handleTeamUpdated)
    socketClient.on('team:deleted', handleTeamDeleted)

    // 初始加载数据
    if (socketClient.isConnected()) {
      console.log('[useTeams] Fetching initial teams')
      socketClient.fetchTeams()
    } else {
      // 等待连接建立后获取数据
      const checkConnection = setInterval(() => {
        if (socketClient.isConnected()) {
          clearInterval(checkConnection)
          console.log('[useTeams] Connection ready, fetching teams')
          socketClient.fetchTeams()
        }
      }, 100)

      return () => {
        clearInterval(checkConnection)
        socketClient.off('teams:updated', handleTeamsUpdated)
        socketClient.off('team:created', handleTeamCreated)
        socketClient.off('team:updated', handleTeamUpdated)
        socketClient.off('team:deleted', handleTeamDeleted)
      }
    }

    // 清理函数
    return () => {
      socketClient.off('teams:updated', handleTeamsUpdated)
      socketClient.off('team:created', handleTeamCreated)
      socketClient.off('team:updated', handleTeamUpdated)
      socketClient.off('team:deleted', handleTeamDeleted)
    }
  }, [setTeams, addTeam, updateTeam, removeTeam, setLoading])

  /**
   * 获取团队数据
   */
  const fetchTeams = () => {
    setLoading(true)
    socketClient.fetchTeams()
  }

  return {
    teams,
    loading,
    error,
    fetchTeams,
  }
}
