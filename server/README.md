# 后端服务器

这是 Agent Teams Monitor 的自定义服务器，整合了 Next.js 和 Socket.IO。

## 文件结构

```
server/
├── index.ts           # 自定义服务器入口
├── socket/
│   ├── server.ts     # Socket.IO 服务器配置
│   └── handlers.ts   # WebSocket 事件处理器
├── watchers/         # 文件监控器
│   ├── index.ts      # 监控管理器
│   ├── team-watcher.ts
│   ├── task-watcher.ts
│   └── inbox-watcher.ts
└── services/         # 业务服务
    ├── claude-paths.ts
    ├── file-reader.ts
    └── parser.ts
```

## 启动服务器

### 开发模式
```bash
npm run dev
```
使用 tsx watch 模式，支持热重载

### 生产模式
```bash
npm run start
```

## API 端点

### Teams
- `GET /api/teams` - 获取所有团队
- `GET /api/teams?id=<teamId>` - 获取指定团队
- 查询参数: `search` - 搜索团队名称或描述

### Tasks
- `GET /api/tasks` - 获取所有任务
- `GET /api/tasks?id=<taskId>` - 获取指定任务
- 查询参数:
  - `teamId` - 按团队过滤
  - `status` - 按状态过滤 (pending|in_progress|completed|failed|cancelled|deleted)
  - `owner` - 按负责人过滤
  - `search` - 搜索任务标题或描述

### Inbox
- `GET /api/inbox` - 获取所有消息
- 查询参数:
  - `teamId` - 按团队过滤
  - `recipient` - 按接收者过滤
  - `type` - 按消息类型过滤 (user|assistant|system)
  - `unreadOnly=true` - 仅返回未读消息
  - `search` - 搜索消息内容

## WebSocket 事件

### 客户端 → 服务器

```typescript
// 订阅频道
socket.emit('subscribe', { channels: ['teams', 'tasks', 'inbox', 'all'] })

// 取消订阅
socket.emit('unsubscribe', { channels: ['teams'] })

// 请求团队详情
socket.emit('getTeam', teamId)

// 心跳
socket.emit('ping')
```

### 服务器 → 客户端

```typescript
// 连接确认
socket.on('connected', (data) => { clientId, timestamp })

// 团队更新
socket.on('team:updated', (data) => { team, timestamp })
socket.on('team:deleted', (data) => { teamId, timestamp })

// 任务更新
socket.on('task:updated', (data) => { task, timestamp })
socket.on('task:deleted', (data) => { taskId, timestamp })

// Inbox 消息
socket.on('inbox:message', (data) => { message, timestamp })

// 心跳响应
socket.on('pong', () => {})

// 错误
socket.on('error', (data) => { message, code })
```

## 响应格式

所有 API 返回统一格式：

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: {
    total: number
    page: number
    limit: number
  }
}
```

## 特性

✅ WebSocket 实时通信
✅ 文件监控和自动更新
✅ RESTful API 设计
✅ 类型安全 (TypeScript)
✅ 优雅关闭处理
✅ 错误处理和日志
