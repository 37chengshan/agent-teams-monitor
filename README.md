# AgentTeams-Monitor-Skills

> 实时监控 Claude Code Agent Teams 运行状态的面板，支持消息查看、团队管理、成员状态追踪和任务进度监控

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)

</div>

---

## 功能特性

- 实时消息监控
- 团队创建与管理
- 成员状态追踪
- 任务进度监控
- 浅色/深色主题切换
- 消息筛选与搜索

---

## 安装

### 方法一：直接克隆（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/37chengshan/agentteams-monitor-skills.git

# 2. 进入目录
cd agentteams-monitor-skills

# 3. 安装依赖
npm install

# 4. 配置端口（可选）
# 编辑 server/.env 设置 Server 端口
# 编辑 client/.env.local 设置 Client 端口
```

### 方法二：全局安装

```bash
npm install -g agentteams-monitor-skills
```

---

## 启动

```bash
npm run dev
```

---

## 端口配置

### Server 端口

创建或编辑 `server/.env` 文件：

```bash
PORT=3002
SERVER_PORT=3002
LOG_LEVEL=info
```

### Client 端口

编辑 `client/.env.local` 文件：

```bash
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
```

---

## 访问地址

| 服务 | 默认端口 |
|------|----------|
| 前端 (Client) | 3000 |
| 后端 (Server) | 3002 |

- 前端：http://localhost:3000
- 后端：http://localhost:3002

---

## License

MIT
