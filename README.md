# CursorClaw

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.x-333333.svg)](https://bun.sh)
[![GitHub Stars](https://img.shields.io/github/stars/keunsy/cursorclaw?style=social)](https://github.com/keunsy/cursorclaw/stargazers)

**通过飞书/钉钉/企业微信远程控制 Cursor AI 的智能助手**

[快速开始](#快速开始) · [功能特性](#核心功能) · [文档](https://github.com/keunsy/cursorclaw#目录) · [贡献指南](CONTRIBUTING.md)

</div>

---

> 基于 [feishu-cursor-claw](https://github.com/nongjun/feishu-cursor-claw) 改进，支持飞书、钉钉、企业微信三个平台。

## ✨ 简介

**CursorClaw** 是一个将 Cursor AI 接入 IM 平台的远程控制中继服务。

📱 **在手机上发消息，Mac 上自动写代码、审文档、执行任务**  
🤖 **将 Cursor 变成你的私人 AI 战略合伙人，随时随地通过 IM 调用**  
🔄 **支持飞书、钉钉、企业微信，三个服务可同时运行**

### 核心优势

- 🌐 **无需公网 IP** - WebSocket 长连接，本地服务主动连接
- 🧠 **持久记忆** - 跨会话记忆系统，AI 记住你的项目和偏好
- 🎯 **项目路由** - 智能识别和切换多个工作区
- ⏰ **定时任务** - AI 可创建定时提醒和周期任务
- 💬 **会话管理** - 支持多会话历史、切换和归档
- 🎙️ **多模态输入** - 文字、语音、图片、文件（飞书/钉钉）

---

## 架构设计

### 整体架构

```
手机飞书 ──WebSocket──→ feishu/server.ts ────┐
                                             ├──→ Cursor CLI ──→ 本地 Cursor IDE
手机钉钉 ──Stream─────→ dingtalk/server.ts ───┤          │
                                             │          │
手机企业微信 ─WebSocket→ wecom/server.ts ──────┘          │
                                                         │
        ┌────────────────────────────────────────────────┘
        │
        ├─→ 项目路由 (projects.json)
        ├─→ 会话管理 (--resume, 自动恢复上下文)
        ├─→ 记忆系统 (.cursor/MEMORY.md + SQLite向量数据库)
        ├─→ 定时任务 (cron-jobs-*.json, AI 创建的定时任务)
        └─→ 心跳系统 (.cursor/HEARTBEAT.md, 定期维护)
```

### 工作原理

**1. 消息接收**
- 飞书：WebSocket 长连接模式，本地服务主动连接飞书服务器
- 钉钉：Stream 长连接模式，本地服务主动连接钉钉服务器
- 企业微信：WebSocket 长连接模式，本地服务主动连接企业微信服务器
- 无需公网 IP，无需端口映射

**2. 消息处理**
```
用户消息 → 解析项目路由 → 多模态处理（文本/图片/语音/文件）
         ↓
    传递给 Cursor CLI
         ↓
    AI 处理（思考、工具调用、回复）
         ↓
    实时流式推送进度卡片
         ↓
    最终结果 + 耗时统计
```

**3. 会话管理**
- 每个项目工作区独立会话
- 自动 `--resume` 恢复上下文
- 同一会话串行，不同会话并发
- Cursor CLI 自主管理生命周期

**4. 记忆系统**
- **短期记忆**：`.cursor/sessions/` 会话转录（JSONL 格式）
- **长期记忆**：`.cursor/MEMORY.md` + `.cursor/memory/` 每日日记
- **向量搜索**：`.memory.sqlite` (FTS5 BM25 + 向量混合搜索)
- **自主检索**：AI 通过 `memory-tool.ts` 自主决定何时搜索记忆

**5. 定时任务**
- AI 通过对话创建定时任务，写入 `cron-jobs-*.json`
- 支持一次性任务、间隔任务、Cron 表达式
- 到期自动执行，结果推送到飞书/钉钉

**6. 心跳系统**
- 定期触发 `.cursor/HEARTBEAT.md` 检查清单
- AI 自主管理检查项（整理记忆、检查状态等）
- 状态追踪：`.cursor/memory/heartbeat-state.json`

---

## 项目结构

```
cursorclaw/
├── shared/                      # 共享模块（三个平台共用）
│   ├── memory.ts                # 记忆管理器 v2（SQLite + 向量 + FTS5）
│   ├── memory-tool.ts           # 记忆 CLI（统一版本，供 Agent 调用）
│   ├── scheduler.ts             # 定时任务调度
│   ├── heartbeat.ts             # 心跳系统
│   └── sync-apple-notes.ts      # Apple Notes 同步
│
├── feishu/                      # 飞书服务（独立）
│   ├── server.ts                # 飞书主服务
│   ├── bridge.ts                # OpenAI API 桥接
│   ├── memory-tool.ts           # 记忆 CLI 包装（转发到 shared）
│   ├── service.sh               # 飞书服务管理脚本
│   └── README.md                # 飞书详细文档
│
├── dingtalk/                    # 钉钉服务（独立）
│   ├── server.ts                # 钉钉主服务
│   ├── dingtalk-client.ts       # 钉钉 Stream 客户端
│   ├── memory-tool.ts           # 记忆 CLI 包装（转发到 shared）
│   ├── service.sh               # 钉钉服务管理脚本
│   └── README.md                # 钉钉详细文档
│
├── wecom/                       # 企业微信服务（独立）
│   ├── server.ts                # 企业微信主服务
│   ├── wecom-helper.ts          # 企业微信工具函数
│   ├── memory-tool.ts           # 记忆 CLI 包装（转发到 shared）
│   ├── service.sh               # 企业微信服务管理脚本
│   └── README.md                # 企业微信详细文档
│
├── projects.json                # 项目路由配置（共享）
├── cron-jobs-feishu.json        # 飞书定时任务
├── cron-jobs-dingtalk.json      # 钉钉定时任务
├── cron-jobs-wecom.json         # 企业微信定时任务
├── manage-services.sh           # 统一服务管理脚本
└── docs/                        # 通用文档
```

## 功能特性

### 核心功能（三平台通用）
- 🚀 **三渠道支持**: 飞书、钉钉、企业微信独立部署，可同时运行
- 💾 **记忆系统**: SQLite 向量数据库 + FTS5 全文搜索
- ⏰ **定时任务**: AI 创建的 Cron 任务，自动执行并推送通知
- ❤️ **心跳检查**: 定期后台维护（整理记忆、检查状态）
- 📁 **项目路由**: 多工作区切换（共享配置）
- 🔄 **会话连续性**: 自动 resume，多会话并发
- 🧠 **身份人格**: OpenClaw 风格的持久记忆与人格系统

### 扩展功能（飞书/钉钉）
- 🎙️ **语音识别**: 火山引擎豆包 STT → 本地 whisper-cpp 降级
- 🖼️ **图片处理**: 自动下载和 OCR 识别
- 📁 **文件处理**: 支持各类文件上传下载
- 📰 **热点新闻推送**: 定时抓取多平台热榜并推送（微博/知乎/百度等）
- 📤 **文件发送**: 本地文件上传到 IM 平台

### 企业微信特色
- ⚡ **流式回复**: 主动推送（延迟更低）vs 飞书轮询刷新
- 🎯 **MVP 优先**: 核心对话功能完整，扩展功能按需添加

---

## 快速开始

### 前置条件

| 项目 | 要求 |
|------|------|
| 系统 | macOS |
| 运行时 | [Bun](https://bun.sh) |
| IDE | [Cursor](https://cursor.com) 已安装并登录 |
| CLI | Cursor Agent CLI (`~/.local/bin/agent`) |

### 选择你的渠道

> 💡 **三个渠道可以同时运行**，互不干扰，共享项目配置和记忆系统。

#### 🟦 安装飞书服务

**安装步骤**（详细说明见 [feishu/README.md](feishu/README.md)）：

```bash
# 1. 安装 Bun 运行时（如果未安装）
curl -fsSL https://bun.sh/install | bash

# 2. 安装 Cursor Agent CLI（如果未安装）
curl https://cursor.com/install -fsS | bash

# 3. 登录 Cursor（一次性操作，之后不需要配置 API Key）
~/.local/bin/agent login

# 4. 创建并配置文件
cd /path/to/cursorclaw

# 创建项目路由配置
cp projects.json.example projects.json
# 编辑 projects.json，配置你的工作区路径

# 创建定时任务配置
cp cron-jobs-feishu.json.example cron-jobs-feishu.json

# 配置飞书凭据
cd feishu
cp .env.example .env
# 编辑 .env，填入：
# - FEISHU_APP_ID=cli_你的APP_ID
# - FEISHU_APP_SECRET=你的SECRET
# - CURSOR_MODEL=auto  # 建议用 auto 节省配额
# - 注释掉 CURSOR_API_KEY（已通过 agent login 登录）

# 5. 安装依赖并启动
cd feishu
bun install
bash service.sh install
```

**飞书后台配置**（服务启动后操作）：

1. 在[飞书开放平台](https://open.feishu.cn)创建企业自建应用
2. 添加**机器人**能力，配置权限：`im:message`、`im:message.group_at_msg`、`im:resource`
3. 复制 **App ID** 和 **App Secret**（已填入上面的 .env）
4. **等本机服务启动后**，在「事件订阅」中选择**长连接模式**，订阅 `im.message.receive_v1`

#### 🟦 安装钉钉服务

```bash
cd dingtalk
cp .env.example .env
# 编辑 .env 填入钉钉凭据
bun install
bash service.sh install
```

详细配置见 [dingtalk/README.md](dingtalk/README.md)

#### 🟩 安装企业微信服务

```bash
cd wecom

# ⚠️ 重要：必须先创建 .env 文件
cp .env.example .env
# 编辑 .env 填入企业微信机器人凭据（BotID 和 Secret）

bun install
bash service.sh install
```

详细配置见 [wecom/README.md](wecom/README.md)

#### 同时使用多个渠道

三个服务可以同时运行，互不干扰：

```bash
# 安装飞书
cd feishu && bash service.sh install && cd ..

# 安装钉钉
cd dingtalk && bash service.sh install && cd ..

# 安装企业微信
cd wecom && bash service.sh install && cd ..

# 使用统一管理脚本
bash manage-services.sh status
```

---

## 服务管理

### 方式一：各自目录独立管理

```bash
# 飞书服务
cd feishu
bash service.sh status     # 查看状态
bash service.sh restart    # 重启
bash service.sh logs       # 查看日志

# 钉钉服务
cd dingtalk
bash service.sh status
bash service.sh restart
bash service.sh logs

# 企业微信服务
cd wecom
bash service.sh status
bash service.sh restart
bash service.sh logs
```

### 方式二：统一管理脚本

```bash
bash manage-services.sh status           # 查看所有服务状态
bash manage-services.sh restart          # 重启所有服务
bash manage-services.sh logs feishu      # 查看飞书日志
bash manage-services.sh logs dingtalk    # 查看钉钉日志
bash manage-services.sh logs wecom       # 查看企业微信日志
```

---

## 使用指南

### 基本对话

在飞书、钉钉或企业微信中 @你的机器人发送消息：

```
@机器人 你好
@机器人 帮我分析一下当前项目的代码结构
@机器人 /帮助
```

### 功能差异说明

各平台功能支持情况：

| 功能类别 | 飞书 | 钉钉 | 企业微信 |
|---------|------|------|---------|
| 核心对话 | ✅ | ✅ | ✅ |
| 语音识别 | ✅ | ✅ | ❌ |
| 图片处理 | ✅ | ✅ | ❌ |
| 文件上传/下载 | ✅ | ✅ | ❌ |
| 新闻推送 | ✅ | ✅ | ❌ |
| 流式回复 | 轮询刷新 | ❌ | ✅ 主动推送 |
| 记忆/定时任务 | ✅ | ✅ | ✅ |

> 💡 **企业微信**采用 MVP 策略，优先保证核心对话体验，扩展功能按需添加

### 常用指令

#### 核心指令（三平台通用）

| 指令 | 中文别名 | 说明 |
|------|----------|------|
| `/help` | `/帮助` `/指令` | 显示所有命令 |
| `/status` | `/状态` | 查看服务状态（模型、Key、会话） |
| `/new` | `/新对话` `/新会话` | 重置当前工作区会话 |
| `/model 名称` | `/模型 名称` | 切换 AI 模型 |
| `/apikey key` | `/密钥 key` | 更换 API Key（仅限私聊） |
| `/stop [项目名]` | `/终止` `/停止` | 终止运行的任务（可指定项目名） |
| `/memory` | `/记忆` | 查看记忆系统状态 |
| `/memory 关键词` | `/记忆 关键词` | 语义搜索记忆 |
| `/log 内容` | `/记录 内容` | 写入今日日记 |
| `/任务` | `/cron` `/定时` | 查看/管理定时任务 |
| `/心跳` | `/heartbeat` | 查看/管理心跳系统 |

#### 扩展指令（飞书/钉钉专用）

| 指令 | 中文别名 | 说明 |
|------|----------|------|
| `/新闻` | `/news` | **热点**：立即推送今日热点；或 `/新闻 每天9点 推送10条` 定时 |
| `/新闻状态` | `/health` | 查看热点数据源健康状态 |
| `/发送文件 <路径>` | `/sendfile` `/send` | 发送本地文件（最大 30MB） |

### 项目路由（多工作区）

**首次配置**：从模板创建配置文件

```bash
cd /path/to/cursorclaw
cp projects.json.example projects.json
# 编辑 projects.json，配置你的工作区
```

配置示例（三个平台共享）：

```json
{
  "projects": {
    "mycode": { "path": "/Users/你/Projects/myapp", "description": "代码项目" },
    "docs": { "path": "/Users/你/Documents/文档", "description": "文档工作区" }
  },
  "default_project": "mycode",
  "memory_workspace": "mycode"
}
```

使用方式（三个平台通用）：
- `docs: 帮我整理文档` → 路由到文档工作区
- `切换到 mycode` → 持久切换到代码项目

**注意**：`projects.json` 已加入 `.gitignore`，不会提交到仓库（本机配置）。

### 热点新闻定时推送 🆕

> ⚠️ **仅飞书和钉钉支持**，企业微信暂未实现

**立即推送**（飞书/钉钉）：
- `/新闻` 或 `/news` - 立即推送今日热点（默认 10 条）
- `/新闻状态` 或 `/health` - 查看数据源健康状态

**定时推送**：在对话中说：
> **每天 9 点推送热点**

系统会自动创建定时任务，到点推送微博、知乎、百度等平台的热榜新闻。

| 说法示例 | 说明 |
|----------|------|
| 每天 9 点推送热点 | 每天 9:00 推送 |
| 18:00 推送热榜 | 每天 18:00 推送 |
| `/任务 执行 <ID>` | 立即执行一次 |

**数据源配置**：参见 [config/README.md](config/README.md)（支持微博、知乎、百度、抖音等 10+ 个平台）

---

### 文件发送功能（飞书/钉钉）

飞书和钉钉服务支持发送本地文件：

```
/发送文件 ~/Desktop/report.pdf
/send /Users/me/Documents/data.xlsx
```

**特性**：
- ✅ 支持绝对路径和 `~` 家目录
- ✅ 自动检查文件存在性和大小
- ✅ 最大 30MB
- ✅ 支持多种文件格式：PDF、DOC/DOCX、XLS/XLSX、PPT、图片、音视频等

**命令行工具**（可选）：

也可以通过命令行直接发送文件：

```bash
# 飞书
cd feishu
bun run send-file.ts /path/to/file.pdf <接收人ID>

# 钉钉
cd dingtalk
bun run send-file-dingtalk.ts /path/to/file.pdf <接收人ID>
```

> ⚠️ **企业微信暂不支持文件发送功能**

详见：[feishu/发送文件到飞书.md](feishu/发送文件到飞书.md)

---

## 配置文件管理

| 文件 | 用途 | Git 管理 |
|------|------|---------|
| `projects.json.example` | 项目路由模板 | ✅ 提交到仓库 |
| `projects.json` | 你的实际项目路径 | ❌ 已忽略 |
| `cron-jobs-*.json.example` | 空的定时任务模板 | ✅ 提交到仓库 |
| `cron-jobs-*.json` | AI 创建的定时任务 | ❌ 已忽略 |
| `config/news-sources.json` | 新闻数据源配置 | ✅ 提交到仓库 |
| `feishu/.env` / `dingtalk/.env` / `wecom/.env` | 实际凭据 | ❌ 已忽略 |

**首次安装**：从 `.example` 文件复制创建配置  
**Git pull 更新**：你的本地配置不会被覆盖

---

## 高级配置

### 语音识别（可选，推荐）

**火山引擎豆包 STT**（高质量中文识别）：

1. 到[火山引擎控制台](https://console.volcengine.com/speech/app)创建应用
2. 开通「大模型流式语音识别」服务
3. 在对应服务的 `.env` 中配置：

```bash
VOLC_STT_APP_ID=你的APP_ID
VOLC_STT_ACCESS_TOKEN=你的ACCESS_TOKEN
```

不配置则自动降级到本地 whisper-cpp（需安装：`brew install whisper-cpp`）。

### 向量记忆搜索（可选）

启用语义记忆搜索功能（在对应服务的 `.env` 中）：

```bash
VOLC_EMBEDDING_API_KEY=你的API_KEY
VOLC_EMBEDDING_MODEL=doubao-embedding-vision-250615
```

---

## 故障排查

### 飞书服务

| 问题 | 解决方案 |
|------|----------|
| 飞书无响应 | `cd feishu && bash service.sh restart` |
| 查看状态 | `cd feishu && bash service.sh status` |
| 查看日志 | `cd feishu && bash service.sh logs` |

### 钉钉服务

| 问题 | 解决方案 |
|------|----------|
| 钉钉无响应 | `cd dingtalk && bash service.sh restart` |
| 查看状态 | `cd dingtalk && bash service.sh status` |
| 查看日志 | `cd dingtalk && bash service.sh logs` |

### 企业微信服务

| 问题 | 解决方案 |
|------|----------|
| 企业微信无响应 | `cd wecom && bash service.sh restart` |
| 查看状态 | `cd wecom && bash service.sh status` |
| 查看日志 | `cd wecom && bash service.sh logs` |

### 通用问题

| 问题 | 解决方案 |
|------|----------|
| **启动失败：找不到 agent 命令** | 安装 Cursor Agent CLI：`curl https://cursor.com/install -fsS \| bash` |
| **启动失败：找不到 bun 命令** | 安装 Bun 运行时：`curl -fsSL https://bun.sh/install \| bash` |
| **无响应：机器人收不到消息** | 检查服务状态：`bash service.sh status`，重启服务：`bash service.sh restart` |
| **配额耗尽：提示团队配额用完** | 编辑 `.env` 将 `CURSOR_MODEL=opus-4.6-thinking` 改为 `auto`（自动选择最优模型） |
| **路径错误：permission denied** | 从 `projects.json.example` 复制后，把 `/Users/你的用户名/` 改为实际路径 |
| **语音识别质量差或乱码** | 配置火山引擎 STT（`.env` 中设置 `VOLC_STT_APP_ID` 和 `VOLC_STT_ACCESS_TOKEN`） |
| **记忆搜索不可用** | 需要配置向量嵌入 API（`.env` 中设置 `VOLC_EMBEDDING_API_KEY`） |

### 常见问题

**Q: 必须配置 API Key 吗？**  
A: 不必须。推荐用 `agent login` 登录，比手动配置 Key 更方便，且支持团队配额。

**Q: 三个平台能同时用吗？**  
A: 能。三个服务独立进程，互不干扰，共享项目配置（`projects.json`）和记忆数据库。

**Q: 如何切换工作区？**  
A: 两种方式：① 对话中说「切换到 项目名」持久切换；② 在消息前加 `项目名:` 临时路由，如「docs: 帮我整理文档」。

**Q: 定时任务怎么创建？**  
A: 直接对话说「每天 9 点推送热点」或「3 分钟后提醒我喝水」，AI 会自动创建任务。查看任务用 `/任务` 指令。

**Q: 怎么让 AI 记住信息？**  
A: 对话中说「记住我喜欢用 TypeScript」或用 `/记录 今天完成了XX功能`，AI 会存入长期记忆并在后续对话中调用。

**Q: 如何查看服务日志？**  
A: 各服务目录下执行 `bash service.sh logs`，或查看 `/tmp/feishu-cursor.log` 等日志文件。

---

## 详细文档

- **飞书服务**: [feishu/README.md](feishu/README.md) - 完整的飞书配置、功能说明和使用指南
- **钉钉服务**: [dingtalk/README.md](dingtalk/README.md) - 完整的钉钉配置、功能说明和使用指南
- **企业微信服务**: [wecom/README.md](wecom/README.md) - 完整的企业微信配置、功能说明和使用指南
- **新闻推送配置**: [config/README.md](config/README.md) - 热点新闻数据源配置说明

---

## 技术栈

| 层 | 飞书 | 钉钉 | 企业微信 |
|---|------|------|---------|
| 运行时 | Bun 1.x + TypeScript | Bun 1.x + TypeScript | Bun 1.x + TypeScript |
| SDK | @larksuiteoapi/node-sdk | dingtalk-stream | @wecom/aibot-node-sdk |
| 连接方式 | WebSocket 长连接 | Stream 长连接 | WebSocket 长连接 |
| 流式回复 | 轮询刷新 | ❌ 不支持 | 主动推送 ⭐ |
| 数据库 | SQLite（向量索引 + FTS5） | SQLite（向量索引 + FTS5） | SQLite（向量索引 + FTS5） |
| 语音识别 | ✅ 火山引擎 → whisper-cpp | ✅ 火山引擎 → whisper-cpp | ❌ 暂未实现 |
| 图片/文件 | ✅ 支持 | ✅ 支持 | ❌ 暂未实现 |
| 新闻推送 | ✅ 支持 | ✅ 支持 | ❌ 暂未实现 |
| 部署 | macOS launchd | macOS launchd | macOS launchd |

**共享模块**（`shared/` 目录）：
- 项目路由配置 (`projects.json`)
- 记忆管理器 (`shared/memory.ts`)
- 记忆工具 CLI (`shared/memory-tool.ts`) - 统一版本 ⭐
- 定时任务系统 (`shared/scheduler.ts`)
- 心跳系统 (`shared/heartbeat.ts`)
- Apple Notes 同步 (`shared/sync-apple-notes.ts`)

---

## 致谢

本项目基于 [feishu-cursor-claw](https://github.com/nongjun/feishu-cursor-claw) 开发，在原项目基础上进行了大量改进和扩展。

### 主要变更

- ✨ **新增钉钉和企业微信渠道支持**（原项目仅支持飞书）
- 🏗️ **独立三服务架构**（飞书、钉钉、企业微信可同时运行，互不干扰）
- 🔧 **统一服务管理**（`manage-services.sh` 统一管理多个服务）
- 📦 **配置文件分离**（每个服务独立 `.env` 和 `cron-jobs.json`）
- 🎯 **增强的项目路由**（共享 `projects.json`，支持持久切换）
- 🔐 **安全增强**（平台隔离，独立环境变量）
- ⚡ **企业微信流式优势**（主动推送 vs 飞书轮询，延迟更低）
- 📱 **多模态扩展**（飞书/钉钉支持语音、图片、文件、新闻推送）

感谢 [@nongjun](https://github.com/nongjun) 的开源贡献。

---

## 开源协议

本项目采用 MIT License 开源。详见 [LICENSE](LICENSE) 文件。

基于 [feishu-cursor-claw](https://github.com/nongjun/feishu-cursor-claw)（同为 MIT License）开发。
