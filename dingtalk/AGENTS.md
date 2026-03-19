# AGENTS.md — dingtalk-cursor-claw

> 钉钉 → Cursor Agent 中继服务 v2

---

## 项目定位

钉钉 → Cursor AI 远程遥控桥接服务。用户在钉钉发消息，server 自动转发给本地 Cursor Agent CLI 执行，执行结果通过钉钉 Markdown 消息回传。

---

## 技术栈

| 层 | 技术 |
|---|------|
| 运行时 | Bun 1.x + TypeScript（直接运行，无需编译） |
| 钉钉 SDK | dingtalk-stream（Stream 长连接） |
| 语音 | 本地 whisper-cpp |
| 部署 | macOS launchd（service.sh 管理） |

---

## 目录结构

```
dingtalk-cursor-claw/
├── server.ts              # 主服务入口：钉钉 Stream → Cursor Agent CLI
├── dingtalk-client.ts     # 钉钉 Stream 客户端封装
├── dingtalk-helper.ts     # 钉钉工具函数
├── start.ts               # 启动脚本
├── start-with-keepawake.ts # 带防休眠的启动脚本
├── service.sh             # 服务管理脚本
├── .cursor/               # 本项目 Cursor 配置
├── feishu/                # 共享的飞书模块（符号链接）
└── (其他符号链接到飞书项目的共享模块)
```

---

## 共享模块（通过符号链接）

以下模块通过 `shared/` 目录共享：

- `bridge.ts` → OpenAI API 桥接
- `memory.ts` → 记忆管理器
- `memory-tool.ts` → 记忆 CLI
- `scheduler.ts` → 定时任务调度器
- `heartbeat.ts` → 心跳系统
- `sync-apple-notes.ts` → Apple Notes 同步
- `backfill-embeddings.ts` → 向量嵌入回填
- `feishu/` → 飞书集成模块（用于代码复用）

---

## 当前状态 v2

**已实现：**
- ✅ 钉钉 Stream 长连接接收消息
- ✅ 调用 Cursor Agent CLI 执行任务
- ✅ 会话管理（--resume 持久化会话）
- ✅ 项目路由（传统 + 对话式 + 持久切换）
- ✅ 消息去重
- ✅ Markdown 回复
- ✅ 语音识别（本地 whisper）
- ✅ 图片、文件处理
- ✅ 命令系统（/help、/模型、/会话、/新闻、/任务 等）
- ✅ 定时任务（独立配置 cron-jobs-dingtalk.json）
- ✅ 心跳系统
- ✅ 记忆搜索（共享飞书记忆库）
- ✅ 新闻推送（定时/立即）

**暂不支持：**
- ⏸️ 实时卡片更新（钉钉限制：不支持消息更新）

---

## 关键设计决策

1. **功能完整** — 命令系统、定时任务、心跳检测、记忆搜索等核心功能已实现
2. **代码复用** — 通过符号链接共享飞书项目的核心模块
3. **独立部署** — 与飞书服务并行运行，互不干扰
4. **对话式路由** — 支持持久切换、临时路由、简化符号三种方式

---

## 对话式路由

支持三种项目路由方式：

1. **持久切换**：`切换到 activity` → 记住项目，后续消息都用它
2. **临时路由**：`帮我看看 api 项目` → 仅本次使用指定项目
3. **简化符号**：`#user 消息` 或 `@api 消息` → 快捷指定项目

---

## 部署与管理

```bash
# 启动服务
./service.sh start

# 停止服务
./service.sh stop

# 重启服务
./service.sh restart

# 查看状态
./service.sh status

# 查看日志
tail -f /tmp/dingtalk-cursor.log
```

---

## 核心功能

### ✅ 已实现（v2.0）

| 功能 | 支持度 | 说明 |
|------|--------|------|
| **消息处理** | 完整 | 文本、语音、图片、文件 |
| **项目路由** | 完整 | 传统 + 对话式 + 持久切换 |
| **命令系统** | 完整 | 11 个命令（详见下方） |
| **会话管理** | 完整 | 历史、切换、归档 |
| **定时任务** | 完整 | 独立配置，推送到钉钉 |

### 📋 支持的命令

**基础命令：**
- `/帮助` `/help` — 显示所有命令
- `/状态` `/status` — 查看服务状态
- `/终止` `/stop` — 停止运行中的任务

**会话管理：**
- `/新对话` `/new` — 归档当前会话，开始新对话
- `/会话` `/sessions` — 查看历史会话列表
- `/会话 编号` — 切换到指定会话

**配置管理：**
- `/模型` `/model` — 查看/切换 AI 模型
- `/密钥` `/apikey` — 查看/更换 API Key

**任务管理：**
- `/任务` `/cron` — 查看所有定时任务
- `/任务 暂停/恢复/删除/执行 ID` — 管理任务

### ⏸️ 暂不支持

- **实时进度更新**（技术限制：钉钉不支持消息更新）

**注**：心跳系统、记忆搜索、新闻推送等功能已完整实现
