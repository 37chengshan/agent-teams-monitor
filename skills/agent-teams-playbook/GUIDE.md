# Agent Teams Playbook - 全局使用指南

## ✅ 安装状态

- ✅ **agent-teams-playbook** - 主编排器已安装
- ✅ **find-skills** - Skill 发现工具已安装
- ⚠️  **planning-with-files** - 计划文件工具 (可选,遇网络问题未安装)

## 🎯 核心理念

从"你指挥 AI 干活"升级到"AI 自己组队干活":

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

## 🚀 快速开始

### 基础使用

在 Claude Code 中直接说:

```bash
# 自然语言触发(推荐)
"拉团队帮我重构认证模块"
"帮我组个 Agent 团队做代码审查"
"用多 Agent 并行处理这个任务"

# 直接指定场景
"用场景4帮我做用户系统"
```

### 触发词列表

以下任一表达都会触发 agent-teams-playbook:

- "多agent"
- "agent协作"
- "agent编排"
- "并行agent"
- "分工协作"
- "拉团队"
- "拉个团队"
- "多代理协作"
- "swarm编排"
- "agent团队"

## 📊 5大编排场景

| 场景 | 适用条件 | 工作方式 | 示例 |
|------|---------|---------|------|
| **场景1: 提示增强** | 简单任务(1-2步) | 优化提示词,不组队 | "帮我改个函数名" |
| **场景2: Skill复用** | 有现成Skill | 直接调用Skill | "用 tdd 帮我写测试" |
| **场景3: 计划+评审** | 中等/复杂任务(默认) | 计划→确认→并行→Review | "重构认证模块" |
| **场景4: Lead-Member** | 需要明确分工 | Leader协调,Member并行 | "做完整用户系统" |
| **场景5: 复合编排** | 超复杂任务 | 动态组合场景 | "从0搭建SaaS" |

## 🔄 6阶段工作流

```
阶段0: 规划准备 (planning-with-files)
  └─ 创建 task_plan.md, findings.md, progress.md
  ↓
阶段1: 任务分析 + Skill发现 (find-skills)
  └─ 扫描本地Skill → 搜索社区Skill → 回退到通用Agent
  ↓
阶段2: 团队组建
  └─ 输出团队蓝图(角色/模型/Skill分配)
  ↓
阶段3: 并行执行
  └─ Skill任务 + Subagent任务混合编排
  ↓
阶段4: 质量把关
  └─ 验收检查 + 产品打磨(边界/专业度/完整性)
  ↓
阶段5: 结果交付
  └─ 执行报告 + 部署说明 + 后续建议
```

## 💡 使用技巧

### 1. 成本优化

编排器会自动选择模型:
- **haiku** - 简单任务(格式化、搜索)
- **sonnet** - 常规编码(默认)
- **opus** - 深度思考(架构设计)

### 2. Skill 回退链

```
本地Skill扫描
    ↓ 未找到
find-skills 搜索社区
    ↓ 未找到/用户拒绝
通用 Subagent 回退
```

### 3. 质量把关

- 验收标准检查
- 边界处理、专业度、完整性打磨
- 最多打回 2 轮修改
- 仍不通过则人工介入

### 4. 用户确认点

关键节点会等待您的确认:
- ✅ 阶段1: 任务拆分计划
- ✅ 阶段2: 团队蓝图
- ✅ 阶段4: 质量问题处理选项

## 🎨 实战示例

### 示例1: 重构认证模块

```bash
你: "拉团队帮我重构认证模块"

AI 输出:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
阶段1: 任务分析
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 字段 | 内容 |
|------|------|
| 任务目标 | 重构用户认证模块,提升安全性和可维护性 |
| 预期结果 | 新的认证架构+单元测试+文档 |
| 验收标准 | 测试覆盖率≥80%,通过安全审查 |
| 范围界定 | must-have: 登录/注册/JWT; add-later: OAuth |
| 预计Agent数 | 4个 |
| 选定场景 | 场景3: 计划+评审 |
| 协作模式 | Subagent |

请确认计划后输入"继续"...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
阶段2: 团队组建
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 编号 | 角色 | 职责 | 模型 | Skill/Type |
|------|------|------|------|------------|
| 1 | 架构师 | 设计认证架构 | opus | general-purpose |
| 2 | 实现者A | 实现登录模块 | sonnet | tdd-guide |
| 3 | 实现者B | 实现JWT模块 | sonnet | tdd-guide |
| 4 | 审查员 | 安全审查 | sonnet | security-review |

正在启动 4 个并行Agent...

✅ 架构师 完成: 认证架构设计
✅ 实现者A 完成: 登录模块+测试(覆盖率85%)
✅ 实现者B 完成: JWT模块+测试(覆盖率82%)
✅ 审查员 完成: 安全审查通过,发现2个已修复问题

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
阶段5: 结果交付
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| 项目 | 内容 |
|------|------|
| 总任务数 | 4个,全部成功 |
| 汇总结论 | 认证模块重构完成,安全性大幅提升 |
| 后续建议 | add-later: OAuth2集成、多因素认证 |
```

### 示例2: 指定场景4

```bash
你: "用场景4帮我做用户系统"

AI 自动跳过决策树,直接执行 Lead-Member 模式:
- Leader 分配任务
- Members 并行执行
- 通过 TaskList 协同进度
```

## 🔧 高级配置

### 手动安装 planning-with-files(可选)

如果需要启用计划文件功能:

```bash
# 方式1: 使用 npx (推荐)
npx skills add anthropic-ai/planning-with-files -y

# 方式2: 手动安装
git clone https://github.com/OthmanAdi/planning-with-files.git
mkdir -p ~/.claude/skills/planning-with-files
cp planning-with-files/SKILL.md ~/.claude/skills/planning-with-files/
```

### 与 Superpowers 组合

在团队组建阶段,AI 会自动分配 Superpowers Skill:

```
架构师 → brainstorming + writing-plans
实现者 → subagent-driven-development + TDD
审查员 → requesting-code-review
收尾员 → finishing-a-development-branch
```

## ⚠️ 注意事项

1. **强制阶段**: 阶段0和阶段1不可跳过
2. **团队规模**: 建议≤5个并行 Agent
3. **质量闸门**: 不会盲目交付不合格成果
4. **失败处理**: 遇到问题会给选项,不是默默重试
5. **成本控制**: 模型选择已优化,避免过度使用 opus

## 📚 参考资源

- [知乎完整教程](https://zhuanlan.zhihu.com/p/2006043401418715855)
- [GitHub 仓库](https://github.com/KimYx0207/agent-teams-playbook)
- [Agent Teams 官方文档](https://docs.anthropic.com)

## 🎉 开始使用

现在就说一句 **"拉团队帮我[您的任务]"**,体验自动组队的强大功能!

---

**版本**: 4.5
**更新**: 2026-02-17
**作者**: KimYx0207
