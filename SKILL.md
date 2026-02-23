# Agent Teams Monitor

## Triggers
- "启动 agent-teams-monitor"
- "agent teams 监控"
- "启动 Agent Teams Monitor"

## Description

实时监控 Claude Code Agent Teams 运行状态的面板，支持：
- 实时消息监控
- 团队创建与管理
- 成员状态追踪
- 任务进度监控
- 浅色/深色主题切换
- 消息筛选与搜索

## Installation

```bash
# 克隆项目
git clone https://github.com/37chengshan/agent-teams-monitor.git
cd agent-teams-monitor

# 安装依赖
npm install
```

## Usage

### 启动服务
```bash
npm run dev
```

### 访问地址
- 前端: http://localhost:3000
- 后端: http://localhost:3002

### 使用 / 命令

在 Claude Code 中直接使用：
```
/agent-teams start   # 启动监控面板
/agent-teams stop    # 停止所有服务
/agent-teams help    # 显示帮助
```

## Environment Variables

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | Client 端口 | 3000 |
| SERVER_PORT | Server 端口 | 3002 |
| NEXT_PUBLIC_SOCKET_URL | Socket 连接地址 | http://localhost:3002 |

## Required Tools

- Read, Write, Edit, Glob, Grep - 文件操作
- Bash - 运行命令
- Task - 任务管理
