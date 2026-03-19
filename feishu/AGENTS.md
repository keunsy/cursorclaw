# AGENTS.md — CursorClaw Feishu

> 本文件是 AI 编码助手理解本项目的入口。所有信息矛盾时以 `文档/` 目录为准。

---

## 项目定位

飞书 → Cursor AI 远程遥控桥接服务。用户在飞书发消息，server 自动转发给本地 Cursor Agent CLI 执行，执行结果通过飞书卡片回传。灵感来自 OpenClaw。

---

## 技术栈

| 层 | 技术 |
|---|------|
| 运行时 | Bun 1.x + TypeScript（直接运行，无需编译） |
| 飞书 SDK | @larksuiteoapi/node-sdk（WebSocket 长连接） |
| 数据库 | SQLite（Bun 内置，记忆向量索引 + FTS5） |
| 语音 | 火山引擎豆包 STT → 本地 whisper-cpp 兜底 |
| 向量 | 火山引擎豆包 Embedding API |
| 部署 | macOS launchd（service.sh 管理） |

---

## 目录结构

```
虾群平台版/
├── server.ts              # 主服务入口：飞书 WebSocket → Cursor Agent CLI
├── bridge.ts              # OpenAI API 桥接（供 OpenClaw 调用）
├── memory.ts              # 记忆管理器 v2（SQLite + 向量 + FTS5）
├── memory-tool.ts         # 记忆 CLI（Cursor Agent 通过 shell 调用）
├── scheduler.ts           # 定时任务调度器（cron-jobs.json 驱动）
├── heartbeat.ts           # 心跳系统（定期触发 HEARTBEAT.md 检查）
├── sync-apple-notes.ts    # Apple Notes 同步
├── backfill-embeddings.ts # 向量嵌入回填工具
├── feishu/                # 飞书集成（17 个 .ts 文件）
│   ├── client.ts          # 飞书 SDK 客户端
│   ├── send.ts            # 消息发送
│   ├── streaming-card.ts  # 流式卡片更新
│   ├── mention.ts         # @提及处理
│   └── types.ts           # 类型定义
├── .cursor/               # 本项目 Cursor 配置
├── 架构.md                # 系统架构鸟瞰图
├── .env / .env.example    # 环境变量
├── package.json           # 项目依赖
└── service.sh / setup.sh  # 部署脚本
```

---

## 模块职责与依赖

### 进程模型

单进程架构，`server.ts` 是唯一的进程入口。所有模块在同一进程内运行。

### 模块关系

- **server.ts** — 主进程，实例化 memory.ts、scheduler.ts、heartbeat.ts，导入 feishu/ 模块
- **memory.ts** — 被 server.ts 实例化，提供记忆读写能力
- **memory-tool.ts** — 独立 CLI 进程，供 Cursor Agent 通过 shell 调用记忆系统
- **scheduler.ts** — 被 server.ts 实例化，读取 cron-jobs.json 驱动定时任务
- **heartbeat.ts** — 被 server.ts 实例化，定期触发 HEARTBEAT.md 检查
- **bridge.ts** — 独立服务，提供 OpenAI 兼容 API（供 OpenClaw 调用）
- **feishu/** — 飞书功能集合，被 server.ts 通过 SDK 导入

---

## 关键设计决策

1. **零提示词污染** — 飞书消息直传 Cursor CLI，server 不拼接任何 system prompt
2. **身份/规则自动注入** — 通过 `.cursor/rules/*.mdc` 的 alwaysApply 机制实现
3. **记忆自主调用** — Cursor Agent 通过 memory-tool.ts CLI 自主管理记忆，server 不注入
4. **会话连续性** — 通过 Cursor CLI `--resume` 参数实现
5. **热更换** — .env 和 projects.json 支持运行时热更换，无需重启服务

---

## 核心编码约束

### 运行时

- **必须使用 Bun**（不支持 Node.js 原生模块）
- 包管理器使用 `bun`（bun install / bun add）
- TypeScript 直接运行，不编译

### 飞书卡片输出限制

所有用户可见回复都经过飞书卡片渲染，必须遵守：

- 单张卡片最多 **5 个 Markdown 表格**
- 卡片 JSON 总大小 **≤ 30KB**（约 3500 中文字）
- 超限内容会渲染失败 → 必须分片或写文件

### 安全红线

- 禁止硬编码 API Key / 密码 / Token / 密钥
- 禁止日志输出用户敏感信息（密码、身份证号等）
- 禁止前端暴露后端内部地址或管理接口
- 禁止将 .env 提交到 Git
- 所有用户输入必须校验，数据库操作使用参数化查询

---

## 文档知识库索引

`文档/` 是唯一真相源，信息矛盾时以此为准。

| 目录 | 内容 |
|------|------|
| [架构.md](架构.md) | 系统架构鸟瞰图、模块依赖、部署拓扑 |
| [文档/设计文档/](文档/设计文档/) | 功能设计方案（均标注验证状态） |
| [文档/核心信念/](文档/核心信念/) | 团队工程原则、编码规范 |
| [文档/执行计划/](文档/执行计划/) | 进行中/已完成的任务计划、技术债务 |
| [文档/产品规格/](文档/产品规格/) | 业务需求定义 |
| [文档/参考资料/](文档/参考资料/) | API 文档、第三方对接 |
| [文档/质量评分/](文档/质量评分/) | 各模块成熟度与改动风险 |
| [文档/凭据与配置/](文档/凭据与配置/) | Token、密码、环境变量（开发环境） |
| [文档/变更日志/](文档/变更日志/) | 重大变更记录 |

---

## 部署与运维

- **运行环境**：macOS（Apple Silicon）本地运行
- **服务管理**：`bash service.sh install/start/stop/restart/logs`（launchd）
- **启动命令**：`bun run server.ts`
- **自动清理**：inbox/ 目录自动清理 24h 前的临时文件
- **凭据**：开发环境凭据见 [文档/凭据与配置/](文档/凭据与配置/)

---

## 修改代码前必读

1. 先阅读 [架构.md](架构.md) 了解系统全貌
2. 查阅 `文档/设计文档/` 确认相关模块的设计方案
3. 查阅 `文档/质量评分/` 了解目标模块的成熟度和改动风险
4. 遵守飞书卡片输出限制（5 表格 / 30KB）
5. 记住：server.ts 是唯一进程入口，所有模块同进程运行
6. 涉及记忆系统时，区分 memory.ts（库）和 memory-tool.ts（CLI）的边界
