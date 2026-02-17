# 服务器集成和配置指南

## 概述

本项目使用自定义服务器整合 Next.js App Router 和 Socket.IO,实现实时数据更新功能。

## 架构

```
┌─────────────────────────────────────────────────┐
│          Custom Server (server/index.ts)        │
├─────────────────────────────────────────────────┤
│  ┌──────────────────┐      ┌─────────────────┐ │
│  │  Next.js App     │      │   Socket.IO     │ │
│  │  Router          │      │   Server        │ │
│  └──────────────────┘      └─────────────────┘ │
│           │                        │            │
│           ▼                        ▼            │
│  ┌──────────────────┐      ┌─────────────────┐ │
│  │   API Routes     │      │  File Watchers  │ │
│  │  /api/teams      │      │  - Teams        │ │
│  │  /api/tasks      │      │  - Tasks        │ │
│  │  /api/inbox      │      │  - Inbox        │ │
│  └──────────────────┘      └─────────────────┘ │
└───────────────────────────��─────────────────────┘
```

## 目录结构

```
server/
├── index.ts                    # 主服务器入口
├── socket/
│   ├── server.ts              # Socket.IO 服务器
│   └── handlers.ts            # 文件监控事件处理
├── watchers/
│   ├── index.ts               # 文件监控管理器
│   ├── team-watcher.ts        # 团队监控
│   ├── task-watcher.ts        # 任务监控
│   └── inbox-watcher.ts       # 消息监控
└── services/
    ├── claude-paths.ts        # Claude 路径配置
    ├── file-reader.ts         # 文件读取工具
    └── parser.ts              # JSON 解析工具
```

## 环境变量配置

### 1. 复制环境变量模板

```bash
cp .env.local.example .env.local
```

### 2. 配置必需的环境变量

编辑 `.env.local` 文件:

```env
# 服务器配置
PORT=3000
HOSTNAME=localhost
NODE_ENV=development

# 客户端配置
NEXT_PUBLIC_WS_URL=ws://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Claude API 路径配置
CLAUDE_PATH_ROOT=C:/Users/MR/.claude
CLAUDE_TEAMS_PATH=C:/Users/MR/.claude/teams
CLAUDE_TASKS_PATH=C:/Users/MR/.claude/tasks
CLAUDE_INBOX_PATH=C:/Users/MR/.claude/inbox
```

## 启动服务器

### 开发模式

```bash
npm run dev
```

这会启动自定义服务器,包含:
- Next.js 开发服务器
- Socket.IO 服务器
- 文件监控器

### 生产模式

```bash
npm run build
npm start
```

## API 路由

### GET /api/teams

获取所有团队列表。

**查询参数:**
- `id`: string - 获取特定团队
- `search`: string - 搜索团队
- `teamId`: string - 按团队ID过滤

**响应:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

### GET /api/tasks

获取所有任务列表。

**查询参数:**
- `id`: string - 获取特定任务
- `teamId`: string - 按团队ID过滤
- `status`: string - 按状态过滤
- `owner`: string - 按负责人过滤
- `search`: string - 搜索任务

**响应:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 20,
    "page": 1,
    "limit": 20
  }
}
```

### GET /api/inbox

获取所有消息列表。

**查询参数:**
- `teamId`: string - 按团队ID过滤
- `recipient`: string - 按接收者过滤
- `type`: string - 按消息类型过滤
- `unreadOnly`: boolean - 仅未读消息
- `search`: string - 搜索消息

**响应:**
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 30,
    "page": 1,
    "limit": 30
  }
}
```

## Socket.IO 事件

### 客户端到服务器事件

#### `subscribe`
订阅频道。

```typescript
socket.emit('subscribe', {
  channels: ['teams', 'tasks', 'inbox', 'all']
})
```

#### `unsubscribe`
取消订阅频道。

```typescript
socket.emit('unsubscribe', {
  channels: ['teams']
})
```

#### `getTeam`
请求特定团队详情。

```typescript
socket.emit('getTeam', 'team-id')
```

#### `ping`
心跳检测。

```typescript
socket.emit('ping')
```

### 服务器到客户端事件

#### `connected`
连接确认。

```typescript
socket.on('connected', (data) => {
  console.log('Connected:', data.clientId)
})
```

#### `team:updated`
团队数据更新。

```typescript
socket.on('team:updated', (data) => {
  console.log('Team updated:', data.team)
})
```

#### `task:updated`
任务数据更新。

```typescript
socket.on('task:updated', (data) => {
  console.log('Task updated:', data.task)
})
```

#### `inbox:message`
新消息到达。

```typescript
socket.on('inbox:message', (data) => {
  console.log('New message:', data.message)
})
```

#### `pong`
心跳响应。

```typescript
socket.on('pong', () => {
  console.log('Pong received')
})
```

#### `error`
错误通知。

```typescript
socket.on('error', (data) => {
  console.error('Error:', data.message)
})
```

## 文件监控

项目使用 `chokidar` 监控 Claude 目录中的文件变化,当文件发生变化时:

1. 文件监控器检测变化
2. 解析新的数据
3. 触发相应的事件
4. Socket.IO 处理器接收事件
5. 广播更新到所有订阅的客户端

### 监控的文件类型

- **Teams**: `~/.claude/teams/*.json`
- **Tasks**: `~/.claude/tasks/*.json`
- **Inbox**: `~/.claude/inbox/*.json`

## CORS 配置

服务器默认允许来自 `localhost:3000` 的请求。在生产环境中,请在 `.env.local` 中配置正确的源:

```env
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

## 安全配置

### HTTPS

在生产环境中启用 HTTPS:

```env
HTTPS_ENABLED=true
SSL_CERT_PATH=/path/to/cert.pem
SSL_KEY_PATH=/path/to/key.pem
```

### 速率限制

建议在生产环境中添加速率限制中间件以防止滥用。

## 故障排除

### 服务器无法启动

1. 检查端口是否被占用:
   ```bash
   netstat -ano | findstr :3000
   ```

2. 检查环境变量是否正确配置:
   ```bash
   npm run dev
   ```

### Socket.IO 连接失败

1. 确认 WebSocket URL 正确:
   ```env
   NEXT_PUBLIC_WS_URL=ws://localhost:3000
   ```

2. 检查浏览器控制台是否有错误信息。

### 文件监控不工作

1. 确认 Claude 路径正确:
   ```env
   CLAUDE_PATH_ROOT=C:/Users/MR/.claude
   ```

2. 检查文件权限,确保服务器可以读取这些目录。

3. 查看服务器日志,检查是否有错误信息。

## 性能优化

1. **文件监控防抖**: 使用 `FILE_WATCHER_DEBOUNCE` 减少不必要的文件读取
2. **WebSocket 心跳**: 定期 ping/pong 保持连接活跃
3. **选择性订阅**: 客户端只订阅需要的频道

## 日志

服务器使用结构化日志系统,日志级别:
- `debug`: 详细调试信息
- `info`: 一般信息
- `warn`: 警告
- `error`: 错误

在 `.env.local` 中配置:

```env
LOG_LEVEL=info
VERBOSE_LOGGING=false
```

## 测试

运行服务器集成测试:

```bash
npm test tests/unit/server/server.test.ts
```

## 部署

### 生产环境检查清单

- [ ] 设置 `NODE_ENV=production`
- [ ] 配置正确的 CORS 源
- [ ] 启用 HTTPS
- [ ] 设置适当的日志级别
- [ ] 配置速率限制
- [ ] 设置监控���告警
- [ ] 配置备份策略

### Docker 部署 (可选)

可以创建 Dockerfile 来容器化应用:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

CMD ["npm", "start"]
```

## 维护

### 更新依赖

```bash
npm update
npm audit fix
```

### 清理缓存

```bash
rm -rf .next
npm run build
```

## 支持

如有问题,请查看:
1. 项目 README.md
2. 代码注释
3. 测试文件
