---
name: agent-teams-playbook
version: "5.0"
description: |
  Agent Teams orchestration playbook for Claude Code. This skill should be used when the user asks to "create agent teams", "use agent swarm", "setup multi-agent collaboration", "orchestrate agents", "coordinate parallel agents", "organize team collaboration", "build agent teams", "implement swarm orchestration", "setup multi-agent system", "coordinate agent collaboration", or needs guidance on adaptive team formation, quality gates, skill discovery, task distribution, team coordination strategies, or Agent Teams best practices.

  中文触发词："多agent"、"agent协作"、"agent编排"、"并行agent"、"分工协作"、"拉团队"、"拉个团队"、"多代理协作"、"swarm编排"、"agent团队"。

  Note: "swarm/蜂群" is a generic industry term; Claude Code's official concept is "Agent Teams".
---

# Agent Teams 编排手册

## 核心理念

从"你指挥 AI 干活"升级到"AI 自己组队干活"：

```
你: "拉团队帮我重构认证模块"
  ↓
AI 自动:
  1. 分析任务复杂度
  2. 选择编排场景
  3. 组建团队并分配角色
  4. 并行执行任务
  5. 质量把关
  6. 交付完整报告
```

## Agent Teams 通信机制

**文件系统消息队列** — 所有通信通过 JSON 文件：

| 文件路径 | 用途 |
|---------|------|
| `~/.claude/teams/{teamId}/config.json` | 团队配置（成员列表） |
| `~/.claude/teams/{teamId}/inboxes/{agentName}.json` | Agent 收件箱（消息数组） |
| `~/.claude/tasks/{teamId}/{taskId}.json` | 任务详情 |

**两种运行模式**:
- **in-process**: AsyncLocalStorage 隔离上下文
- **tmux**: 独立进程通信

**消息投递**: 只在 conversation turn 之间

## 适用场景决策

| 适用 | 不适用 |
|------|--------|
| 跨文件重构、多维度审查 | 单文件小修改 |
| 大规模代码生成、并行处理 | 简单问答、线性顺序任务 |
| 需要多角色协作的复杂任务 | 单 agent 可完成的任务 |

## 5 大编排场景

| # | 场景 | 适用条件 | 核心策略 |
|---|------|---------|---------|
| 1 | 提示增强 | 简单任务，1-2步 | 优化提示词，不拆分不组队 |
| 2 | Skill 复用 | 任务可由单个 Skill 完全解决 | 直接调用 Skill |
| 3 | 计划+评审 | 中等/复杂任务（**默认**） | 计划 → 确认 → 并行 → Review |
| 4 | Lead-Member | 需要明确团队分工 | Leader 协调，Member 并行 |
| 5 | 复合编排 | 复杂任务，无固定模式 | 动态组合场景 |

## 6 阶段工作流

### 阶段 0：规划准备
```
Skill(skill="planning-with-files")
```
创建 `task_plan.md`、`findings.md`、`progress.md`

### 阶段 1：任务分析 + Skill 发现

输出任务总览：
- 任务目标、预期结果、验收标准
- 范围界定（must-have vs add-later）
- 预计 Agent 数、选定场景、协作模式

**Skill 回退链**（强制执行）：
1. 本地 Skill 扫描
2. `Skill(skill="find-skills", args="关键词")`
3. 通用 Subagent 回退

### 阶段 2：团队组建

输出团队蓝图：
| 编号 | 角色 | 职责 | 模型 | Skill/Type |

### 阶段 3：并行执行

- Skill 任务：`Skill(skill="skill-name", args="任务")`
- 通用任务：`Task(prompt="任务描述")`
- 每完成汇报：`✅ [角色名] 完成: [结果]`

### 阶段 4：质量把关

- 验收标准检查
- 边界处理、专业度、完整性打磨
- 最多打回 2 轮修改

### 阶段 5：结果交付

输出执行报告：
- 总任务数、成功/失败统计
- 各 Agent 结果
- 汇总结论、后续建议

## 执行底线

**硬性标准**：
1. 强制使用 planning-with-files 创建计划文件
2. 强制执行 Skill 完整回退链

**其他原则**：
- 先目标，后组织结构
- 团队规模 ≤ 5 个并行 Agent
- 关键里程碑必须有质量闸门
- 危险操作必须用户确认

## 故障处理

| 故障类型 | 处理策略 |
|---------|---------|
| Agent 执行失败 | 通知用户，提供重试/跳过/终止选项 |
| Skill 不可用 | 按回退链降级 |
| 模型超时 | 调整任务复杂度或拆分子任务 |
| 质量不达标 | 打回修改最多 2 轮 |

## 模型分工

- **haiku**: 简单任务（格式化、搜索）
- **sonnet**: 常规编码（默认）
- **opus**: 深度思考（架构设计）
