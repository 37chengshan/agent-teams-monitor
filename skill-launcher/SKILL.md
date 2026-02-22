# AgentTeams-Monitor-Skills

## Triggers
- "启动agentteams-monitor-skills"
- "agentteams-monitor-skills"
- "agent teams监控"

## Description
实时监控 Claude Code Agent Teams 的运行状态，支持消息查看、团队管理、成员状态和任务追踪。

安装时会交互式提示配置：
- Server 端口（默认 3002）
- Client 端口（默认 3000）

## Usage

### 安装
```bash
npm install -g agentteams-monitor-skills
```

安装过程中会提示配置端口：
```
🎯 AgentTeams-Monitor-Skills 安装向导

Server端口 (默认 3002): 8080
Client端口 (默认 3000): 3000

✅ 配置完成！
   Server: http://localhost:8080
   Client: http://localhost:3000
```

### 启动
```bash
agentteams-monitor-skills
```

或者手动启动：
```bash
cd 你安装的目录
npm run dev
```

### 访问
- 前端: http://localhost:配置的端口
- 后端: http://localhost:3002

## Environment Variables

| 变量 | 说明 | 默认值 |
|------|------|--------|
| PORT | Client端口 | 3000 |
| SERVER_PORT | Server端口 | 3002 |
| NEXT_PUBLIC_SOCKET_URL | Socket连接地址 | http://localhost:3002 |

## Features
- 实时消息监控
- 团队创建与管理
- 成员状态追踪
- 任务进度监控
- 浅色/深色主题切换
- 消息筛选与搜索
- 消息已读/未读状态

## Required Tools
- Read, Write, Edit, Glob, Grep - 文件操作
- Bash - 运行命令
- Task - 任务管理

## Project Path
项目默认路径: `~/.claude/plugins/agentteams-monitor-skills`

如需修改项目路径，请编辑 `install.js` 中的 `PROJECT_PATH` 常量。
