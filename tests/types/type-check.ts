/**
 * Socket.IO 类型验证
 * 这个文件仅用于 TypeScript 类型检查,不需要运行
 */

import type { ServerToClientEvents, ClientToServerEvents } from '../../src/lib/socket/types'
import type { Team, Task, InboxMessage } from '../../src/lib/types'

// ========== ServerToClientEvents 类型验证 ==========

// connected 事件
const _validateConnected: ServerToClientEvents['connected'] = (data) => {
  const _clientId: string = data.clientId
  const _timestamp: number = data.timestamp
}

// team:updated 事件
const _validateTeamUpdated: ServerToClientEvents['team:updated'] = (data) => {
  const _team: Team = data.team
  const _timestamp: number = data.timestamp
}

// team:deleted 事件
const _validateTeamDeleted: ServerToClientEvents['team:deleted'] = (data) => {
  const _teamId: string = data.teamId
  const _timestamp: number = data.timestamp
}

// teams:updated 事件
const _validateTeamsUpdated: ServerToClientEvents['teams:updated'] = (teams) => {
  const _teams: Team[] = teams
}

// task:updated 事件
const _validateTaskUpdated: ServerToClientEvents['task:updated'] = (data) => {
  const _task: Task = data.task
  const _timestamp: number = data.timestamp
}

// task:deleted 事件
const _validateTaskDeleted: ServerToClientEvents['task:deleted'] = (data) => {
  const _taskId: string = data.taskId
  const _timestamp: number = data.timestamp
}

// tasks:updated 事件
const _validateTasksUpdated: ServerToClientEvents['tasks:updated'] = (tasks) => {
  const _tasks: Task[] = tasks
}

// inbox:message 事件
const _validateInboxMessage: ServerToClientEvents['inbox:message'] = (data) => {
  const _message: InboxMessage = data.message
  const _timestamp: number = data.timestamp
}

// inbox:updated 事件
const _validateInboxUpdated: ServerToClientEvents['inbox:updated'] = (messages) => {
  const _messages: InboxMessage[] = messages
}

// error 事件
const _validateError: ServerToClientEvents['error'] = (error) => {
  const _message: string = error.message
  const _code: string | undefined = error.code
}

// connect 事件
const _validateConnect: ServerToClientEvents['connect'] = () => {
  // 无参数
}

// disconnect 事件
const _validateDisconnect: ServerToClientEvents['disconnect'] = (reason) => {
  const _reason: string = reason
}

// pong 事件
const _validatePong: ServerToClientEvents['pong'] = () => {
  // 无参数
}

// ========== ClientToServerEvents 类型验证 ==========

// subscribe 事件
const _validateSubscribe: ClientToServerEvents['subscribe'] = (data) => {
  const _channels: ('teams' | 'tasks' | 'inbox' | 'all')[] = data.channels
}

// unsubscribe 事件
const _validateUnsubscribe: ClientToServerEvents['unsubscribe'] = (data) => {
  const _channels: ('teams' | 'tasks' | 'inbox' | 'all')[] = data.channels
}

// teams:fetch 事件
const _validateTeamsFetch: ClientToServerEvents['teams:fetch'] = () => {
  // 无参数
}

// tasks:fetch 事件
const _validateTasksFetch: ClientToServerEvents['tasks:fetch'] = () => {
  // 无参数
}

// inbox:fetch 事件
const _validateInboxFetch: ClientToServerEvents['inbox:fetch'] = () => {
  // 无参数
}

// getTeam 事件
const _validateGetTeam: ClientToServerEvents['getTeam'] = (teamId) => {
  const _teamId: string = teamId
}

// ping 事件
const _validatePing: ClientToServerEvents['ping'] = () => {
  // 无参数
}

console.log('✅ All Socket.IO types are valid!')
