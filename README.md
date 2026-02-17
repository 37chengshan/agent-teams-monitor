# Agent Teams Monitor

实时监控 Claude Code Agent Teams 之间 JSON 文件通信的 Web 应用。

## 工作原理

Claude Code 的 Agent Teams 功能采用极其朴素的通信机制：**文件系统消息队列**。

### 核心通信机制

Agent Teams 通过以下方式通信：

1. **团队配置**: `~/.claude/teams/{teamId}/config.json`
   - 包含团队成员信息和任务列表关联

2. **Agent Inbox**: `~/.claude/teams/{teamId}/inboxes/{agentName}.json`
   - 每个 agent 有独立的 inbox 文件
   - 收到的消息会追加到这个文件（JSON 数组）
   - 消息包含：from、text、summary、timestamp、read 等字段

3. **任务存储**: `~/.claude/tasks/{teamId}/{taskId}.json`
   - 任务详细信息和状态
   - 支持 blockedBy 依赖关系

4. **消息类型**:
   - **普通 DM**: 文本对话消息
   - **协议消息**: JSON 字符串包裹的系统消息
     - `idle_notification`: agent 空闲通知
     - `shutdown_request`: 关闭请求
     - `shutdown_response`: 关闭响应
     - `plan_approval_request`: 计划批准请求

### 技术架构

```
┌─────────────────┐     文件监控      ┌──────────────────┐
│  Claude Code    │◄─────────────────┤  chokidar        │
│  Agent Teams    │                   │  File Watcher    │
└─────────────────┘                   └────────┬─────────┘
       │                                     │
       │ JSON 文件读写                       │ Socket.IO
       │                                     ▼
       │                             ┌──────────────────┐
       └────────────────────────────▶│  Web Dashboard   │
              实时同步                  │  (Next.js)       │
                                      └──────────────────┘
```

**核心组件**:
- **chokidar**: 监控 `~/.claude/teams/` 和 `~/.claude/tasks/` 目录变化
- **Socket.IO**: 实时推送文件变更到 Web 界面
- **Next.js**: 提供 Web 监控面板

### Agent 上下文管理

Claude Code 使用 Node.js 的 **AsyncLocalStorage** 实现 agent 上下文隔离：

```javascript
var T7A = new AsyncLocalStorage();
function getTeammateContext() { return T7A.getStore(); }
function runWithTeammateContext(ctx, fn) { return T7A.run(ctx, fn); }
```

**两种运行模式**:
- **in-process**: 在主进程内用 AsyncLocalStorage 隔离
- **tmux**: 在独立 tmux pane 里运行完全独立的进程

### 消息投递时机

消息只在 **conversation turn 之间** 投递：

1. 一个 turn = 一个 Claude API 调用周期
2. agent 正在执行时收不到消息
3. 只有 turn 完成后才会检查 inbox

这可能导致一个 bug：tmux 模式下，新 spawn 的 teammate 如果没有完成第一个 turn，永远不会开始轮询 inbox。

## 技术栈

- **框架**: Next.js 15 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS v4
- **UI 组件**: shadcn/ui
- **动画**: Framer Motion
- **主题**: next-themes
- **实时通信**: Socket.IO
- **文件监控**: chokidar
- **状态管理**: Zustand

## 项目结构

```
agent-teams-monitor/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API 路由
│   │   │   ├── teams/            # 团队数据 API
│   │   │   ├── tasks/            # 任务数据 API
│   │   │   └── inbox/            # 消息数据 API
│   │   ├── layout.tsx            # 根布局
│   │   └── page.tsx              # 监控面板页面
│   ├── components/
│   │   ├── ui/                   # shadcn/ui 组件
│   │   ├── animations/           # Framer Motion 动画
│   │   ├── teams/                # 团队相关组件
│   │   ├── tasks/                # 任务相关组件
│   │   ├── inbox/                # 消息相关组件
│   │   ├── layout/               # 布局组件
│   │   └── providers/            # React Context 提供者
│   ├── lib/
│   │   ├── types/                # TypeScript 类型定义
│   │   ├── services/             # 数据服务层
│   │   ├── stores/               # Zustand 状态管理
│   │   ├── hooks/                # 自定义 React Hooks
│   │   ├── socket/               # Socket.IO 客户端
│   │   └── constants/            # 常量配置
│   └── middleware.ts             # Next.js 中间件
├── server/
│   ├── index.ts                  # 自定义服务器入口
│   ├── socket/                   # Socket.IO 服务器
│   │   ├── server.ts             # Socket.IO 配置
│   │   └── handlers.ts           # 事件处理器
│   └── watchers/                 # 文件监控器
│       ├── index.ts              # 监控管理器
│       ├── team-watcher.ts       # 团队配置监控
│       ├── task-watcher.ts       # 任务文件监控
│       └── inbox-watcher.ts      # 消息文件监控
├── skills/                       # Agent Teams Playbook Skill
│   └── agent-teams-playbook/     # 多 Agent 编排手册
├── public/                       # 静态资源
├── .env.local                    # 环境变量配置
├── next.config.mjs               # Next.js 配置
├── tailwind.config.ts            # Tailwind CSS 配置
└── tsconfig.json                 # TypeScript 配置
```

## 配置

### 1. 复制环境变量模板

```bash
cp .env.local.example .env.local
```

### 2. 编辑 .env.local

根据你的系统配置 Claude 路径：

```bash
# Claude 目录路径（Windows 使用正斜杠）
CLAUDE_DIR=C:/Users/YOUR_USERNAME/.claude

# WebSocket URL
NEXT_PUBLIC_WS_URL=ws://localhost:3000

# CORS 配置（如需要）
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 运行开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看监控面板。

### 构建生产版本

```bash
npm run build
npm start
```

## 功能特性

### 实时监控仪表板

- **活跃团队统计**: 当前运行的团队数量
- **任务追踪**: 进行中和已完成的任务
- **消息监控**: 未读消息和实时通信
- **成员状态**: 每个 agent 的状态和活动

### 团队详情

- 查看团队成员配置
- 监控团队任务执行
- 追踪消息通信历史

### 任务管理

- 查看所有团队任务
- 任务依赖关系可视化
- 任务状态实时更新

### 消息收件箱

- 查看所有 agent 间通信
- 消息过滤和搜索
- 协议消息高亮显示

## 测试 Agent Teams

创建一个测试团队来验证监控功能：

1. 在 Claude Code 中使用 `TeamCreate` 创建团队
2. 添加多个 agents
3. 让它们互相发送消息
4. 观察监控界面实时更新

## 已知问题

Claude Code Agent Teams 的一些已知限制：

| Issue | 描述 | 状态 |
|-------|------|------|
| Context Compaction | 长任务后上下文压缩导致团队感知丢失 | OPEN |
| Agent 生命周期 | 重复 spawn、轮询浪费 | OPEN |
| MEMORY.md 并发 | 多 teammate 同时写会覆盖 | OPEN |
| 任务通知淹没 | TaskUpdate 加速上下文消耗 | OPEN |

## 故障排除

### 文件监控不工作

- 检查 `CLAUDE_DIR` 路径是否正确
- 确认服务器有读取权限
- 验证 `~/.claude/teams/` 目录存在

### Socket.IO 连接失败

- 检查 `NEXT_PUBLIC_WS_URL` 配置
- 查看 CORS 设置
- 检查防火墙设置

### 数据不更新

- 确认 Claude Code 正在运行且有活跃团队
- 检查文件监控器是否正常启动
- 查看浏览器控制台错误信息

## Agent Teams Playbook

项目内置了 **Agent Teams Playbook** Skill，提供多 Agent 协作编排指南：

- 5 大编排场景
- 6 阶段工作流
- Skill 自动发现
- 质量把关机制

详见 `skills/agent-teams-playbook/` 目录。

## 参考资源

- [Claude Code 官方文档](https://docs.anthropic.com)
- [Agent Teams GitHub Issues](https://github.com/anthropics/claude-code/issues)
- [Agent Teams 原理解析](https://zhuanlan.zhihu.com/p/2006043401418715855)

## License

MIT
