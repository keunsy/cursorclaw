# dingtalk-cursor-claw

> 钉钉 → Cursor Agent 远程控制
> 基于 feishu-cursor-claw 的钉钉版本

## 快速开始

### 步骤 1: 安装依赖工具（如未安装）

```bash
# 安装 Bun 运行时
curl -fsSL https://bun.sh/install | bash

# 安装 Cursor Agent CLI
curl https://cursor.com/install -fsS | bash

# 登录 Cursor（一次性操作，之后不需要 API Key）
~/.local/bin/agent login
# 按提示在浏览器中完成登录
```

### 步骤 2: 配置钉钉应用

1. 进入[钉钉开发者后台](https://open-dev.dingtalk.com/)
2. 创建企业内部应用
3. 添加机器人能力，选择 **Stream 模式**
4. 配置权限：
   - 企业内机器人消息接收
   - 消息内容读取权限
   - 文件下载权限
5. 事件订阅：Stream 模式，订阅 `/v1.0/im/bot/messages/get`
6. 获取 AppKey 和 AppSecret

### 步骤 3: 创建配置文件并启动服务

```bash
# 创建配置文件（从模板）
cd /path/to/cursorclaw
cp projects.json.example projects.json
# 编辑 projects.json，配置你的工作区路径

cp cron-jobs-dingtalk.json.example cron-jobs-dingtalk.json

# 配置钉钉凭据
cd dingtalk
cp .env.example .env
# 编辑 .env，填入：
# - DINGTALK_APP_KEY=你的AppKey
# - DINGTALK_APP_SECRET=你的AppSecret
# - CURSOR_MODEL=auto  # 建议用 auto 节省配额
# - 注释掉 CURSOR_API_KEY（已通过 agent login 登录）

# 安装依赖并启动
bun install
bash service.sh install

# 检查服务状态
bash service.sh status
# 应该显示：🟢 运行中 (PID: xxxxx)
```

**配置文件说明**：
- `projects.json` - 项目路由配置（已加入 .gitignore，本机配置）
- `cron-jobs-dingtalk.json` - 定时任务存储（已加入 .gitignore，运行时写入）
- `.env` - 环境变量（已加入 .gitignore，敏感信息）

### 步骤 4: 测试

在钉钉中找到你的机器人，发送：

```
@机器人 你好
```

如果收到回复，说明安装成功！

---

## 完整安装示例（实测流程）

以下是一台全新 Mac 的完整安装流程：

```bash
# 1. 安装 Bun
curl -fsSL https://bun.sh/install | bash
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

# 2. 安装 Cursor Agent CLI
curl https://cursor.com/install -fsS | bash
export PATH="$HOME/.local/bin:$PATH"

# 3. 登录 Cursor
~/.local/bin/agent login
# 在浏览器中完成登录（会显示登录成功的邮箱）

# 4. 克隆项目（或进入已有项目）
cd ~/work/cursor/cursorclaw

# 5. 创建配置文件（从模板）
cp projects.json.example projects.json
nano projects.json
# 配置你的工作区路径，例如：
# "mycode": { "path": "/Users/你的用户名/Projects/myapp", ... }

cp cron-jobs-dingtalk.json.example cron-jobs-dingtalk.json

# 6. 配置钉钉凭据
cd dingtalk
cp .env.example .env
nano .env
# 填入：
# DINGTALK_APP_KEY=你的AppKey
# DINGTALK_APP_SECRET=你的AppSecret
# CURSOR_MODEL=auto  # 改为 auto 节省配额
# 注释掉 CURSOR_API_KEY 行（保持为 # CURSOR_API_KEY=）

# 7. 安装并启动
bun install
bash service.sh install

# 8. 检查状态
bash service.sh status
# 应该显示：🟢 运行中

# 9. 查看日志确认连接成功
bash service.sh logs
# 应该看到：钉钉 Stream 连接已建立，等待消息...
```

**配置文件说明**：
- `projects.json`, `cron-jobs-*.json`, `.env` 已加入 `.gitignore`
- 这些是本机运行时配置，不会提交到仓库
- 每次 git pull 不会覆盖你的配置

---

## 使用方式

### 基本对话

```
在钉钉中 @机器人 发送消息：

@机器人 你好
@机器人 帮我分析一下当前项目的代码结构
```

### 项目路由

**首次配置**（从模板创建）：

```bash
cd /path/to/cursorclaw
cp projects.json.example projects.json
nano projects.json
```

配置示例：

```json
{
  "projects": {
    "code": { "path": "/Users/你/Projects/myapp", "description": "代码项目" },
    "docs": { "path": "/Users/你/Documents/文档", "description": "文档工作区" }
  },
  "default_project": "code",
  "memory_workspace": "code"
}
```

使用方式：

```
code: 帮我分析代码      → 路由到 code 项目
docs: 审查文档          → 路由到 docs 项目
直接发消息             → 默认项目
```

**注意**：`projects.json` 已加入 `.gitignore`，不会提交到仓库（本机配置）。

### 文件发送

发送本地文件到钉钉：

```
/发送文件 ~/Desktop/app-debug.apk
/send ~/Documents/report.pdf
```

**支持：**
- APK/IPA
- PDF, DOC, XLS, PPT
- 图片、音视频
- 压缩包
- 最大 30MB

### 启动自检与出生仪式

**启动自检：**
- 服务启动时自动执行 `.cursor/BOOT.md`
- 检查配置、记忆、任务状态
- 可选推送结果到钉钉

**出生仪式：**
- 首次对话触发 `.cursor/BOOTSTRAP.md`
- AI 自我介绍、了解主人
- 完成后自动删除文件

## 配置文件管理

| 文件 | 用途 | Git 管理 |
|------|------|---------|
| `projects.json.example` | 项目路由模板 | ✅ 提交到仓库 |
| `projects.json` | 你的实际项目路径 | ❌ 已忽略（本机配置） |
| `cron-jobs-dingtalk.json.example` | 空的定时任务模板 | ✅ 提交到仓库 |
| `cron-jobs-dingtalk.json` | AI 创建的定时任务 | ❌ 已忽略（运行时数据） |
| `.env.example` | 环境变量模板 | ✅ 提交到仓库 |
| `.env` | 你的实际凭据 | ❌ 已忽略（敏感信息） |

**工作流程**：
1. 首次安装：从 `.example` 文件复制创建配置
2. Git pull 更新：你的本地配置不会被覆盖
3. 分享代码：敏感信息和本机路径不会泄露

---

## 功能特性

### 完整版本（当前 v3.0）

**消息处理**:
- ✅ 文本消息处理
- ✅ 语音消息识别（火山引擎 → 本地 whisper 降级）
- ✅ 图片下载与处理
- ✅ 文件下载与处理
- ✅ Markdown 响应

**核心功能**:
- ✅ 项目路由（传统 + 对话式 + 持久切换）
- ✅ 会话管理（历史/切换/归档，--resume 自动恢复）
- ✅ 完整命令系统（11+ 个命令）
- ✅ 记忆系统（语义搜索、日记记录、全工作区索引）
- ✅ 定时任务（查看/暂停/恢复/删除/执行）
- ✅ 心跳系统（定期检查、主动推送）

**扩展功能**:
- ✅ **热点新闻推送**（立即推送 + 定时推送）
- ✅ **文件发送**（/发送文件 命令，最大 30MB）
- ✅ **启动自检**（.cursor/BOOT.md 自动执行）
- ✅ **出生仪式**（.cursor/BOOTSTRAP.md 首次对话）
- ✅ **工作区模板**（自动初始化 .cursor/ 目录）

### 用户体验优化

- **执行耗时统计** - 任务完成时显示执行时长（"✅ 完成 · 2分15秒"）
- **模型自动降级** - 余额不足时自动切换 auto 模型，避免中断
- **错误智能引导** - API Key 失效、超时等错误自动显示修复步骤

### 计划中

- ⏳ 实时卡片更新（钉钉 Stream 限制）
- ⏳ 更多消息类型支持

## 服务管理

### 钉钉独立管理

```bash
cd dingtalk
bash service.sh install    # 安装开机自启动（基于 launchd）
bash service.sh start      # 启动服务
bash service.sh stop       # 停止服务
bash service.sh restart    # 重启服务
bash service.sh status     # 查看运行状态
bash service.sh logs       # 查看实时日志（Ctrl+C 退出）
bash service.sh uninstall  # 卸载自启动
```

**服务特性**：
- ✅ **开机自启动**：基于 macOS launchd 自动启动
- ✅ **崩溃自动恢复**：进程异常退出会自动重启
- ✅ **防止睡眠**：使用 `caffeinate` 防止系统空闲睡眠
- ✅ **进程清理**：`stop` 命令强制杀死所有相关进程
- ✅ **日志输出**：标准输出和错误输出统一记录到 `/tmp/dingtalk-cursor.log`

## 与飞书版共存

钉钉版和飞书版可以同时运行，互不干扰：

| 服务 | 标签 | 日志路径 | 端口 |
|------|------|---------|------|
| 飞书 | com.feishu-cursor-claw | /tmp/feishu-cursor.log | - |
| 钉钉 | com.dingtalk-cursor-claw | /tmp/dingtalk-cursor.log | - |

**共享配置**（位于根目录）：
- `projects.json` - 项目路由配置
- 两个服务使用相同的项目路由规则

**独立配置**：
- `feishu/.env` - 飞书凭据
- `dingtalk/.env` - 钉钉凭据
- `cron-jobs-feishu.json` - 飞书定时任务
- `cron-jobs-dingtalk.json` - 钉钉定时任务

**统一管理**：
```bash
# 使用根目录的统一管理脚本
cd /path/to/cursorclaw
bash manage-services.sh status           # 查看所有服务
bash manage-services.sh restart          # 重启所有服务
bash manage-services.sh logs feishu      # 飞书日志
bash manage-services.sh logs dingtalk    # 钉钉日志
```
- 核心模块（bridge.ts、memory.ts等通过符号链接）
- 工作区记忆（`.cursor/MEMORY.md`）

独立：
- IM 连接和消息协议
- 会话上下文
- 日志文件

## 高级配置

### 语音识别（可选，推荐）

**火山引擎豆包 STT**（高质量中文识别）：

1. 到[火山引擎控制台](https://console.volcengine.com/speech/app)创建应用
2. 开通「大模型流式语音识别」服务
3. 在 `dingtalk/.env` 中配置：

```bash
VOLC_STT_APP_ID=你的APP_ID
VOLC_STT_ACCESS_TOKEN=你的ACCESS_TOKEN
```

不配置则自动降级到本地 whisper-cpp（需安装：`brew install whisper-cpp`）。

**降级链路**：火山引擎豆包 → 本地 whisper-cpp → 告知用户

### 向量记忆搜索（可选）

启用语义记忆搜索功能（在 `dingtalk/.env` 中）：

```bash
VOLC_EMBEDDING_API_KEY=你的API_KEY
VOLC_EMBEDDING_MODEL=doubao-embedding-vision-250615
```

首次启动自动索引工作区全部文本文件（`.md` `.txt` `.html` `.json` `.mdc` 等，自动跳过 `.git`、`node_modules`、超大文件）。

---

## 环境变量配置

在 `dingtalk/.env` 中配置：

| 变量 | 必填 | 说明 | 默认值 |
|------|------|------|--------|
| `DINGTALK_APP_KEY` | ✅ | 钉钉应用 AppKey | - |
| `DINGTALK_APP_SECRET` | ✅ | 钉钉应用 AppSecret | - |
| `CURSOR_API_KEY` | ❌ | Cursor API Key（如已 `agent login` 则不需要） | - |
| `CURSOR_MODEL` | ❌ | AI 模型 | `auto` |
| `VOLC_STT_APP_ID` | ❌ | 火山引擎语音识别 APP ID | - |
| `VOLC_STT_ACCESS_TOKEN` | ❌ | 火山引擎语音识别 Token | - |
| `VOLC_EMBEDDING_API_KEY` | ❌ | 向量嵌入 API Key | - |
| `VOLC_EMBEDDING_MODEL` | ❌ | 向量嵌入模型 | `doubao-embedding-vision-250615` |

**重要提示**：
- 运行 `agent login` 后，无需配置 `CURSOR_API_KEY`
- 推荐使用 `auto` 模型节省配额
- `.env` 文件支持热更新，修改后无需重启

---

## 故障排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 钉钉无响应 | 服务未启动或异常 | `cd dingtalk && bash service.sh restart` |
| `API Key 无效` | .env 中有无效占位符 | 运行 `agent login` 登录，注释掉 .env 中的 `CURSOR_API_KEY` |
| `团队配额已用完` | 使用高消耗模型 | 改用 `auto` 模型（编辑 .env 中的 `CURSOR_MODEL=auto`） |
| `permission denied /Users/user` | projects.json 路径错误 | 把 projects.json 中的 `/Users/user` 改为实际用户名 |
| 语音识别失败 | whisper 未安装 | `brew install whisper-cpp` 或配置火山引擎 STT |
| `agent: command not found` | Agent CLI 未安装 | `curl https://cursor.com/install -fsS \| bash` |
| `bun: command not found` | Bun 未安装 | `curl -fsSL https://bun.sh/install \| bash` |

### 查看日志

```bash
cd dingtalk
bash service.sh status     # 查看状态
bash service.sh logs       # 查看实时日志
```

### 常见问题

**Q: 如何获取钉钉 AppKey 和 AppSecret？**  
A: 访问[钉钉开发者后台](https://open-dev.dingtalk.com)，创建企业内部应用 → 开发配置中查看凭据。

**Q: Stream 模式和 Webhook 模式有什么区别？**  
A: Stream 模式无需公网 IP，本地服务主动连接钉钉服务器，配置更简单；Webhook 需要公网回调地址。

**Q: 钉钉为什么不支持实时更新进度？**  
A: 钉钉 API 限制，不支持消息更新。飞书和企业微信支持流式进度刷新。

**Q: 如何在群聊中使用？**  
A: 机器人添加到群后，用 `@机器人 消息` 调用。注意敏感命令（如 `/密钥`）仅限私聊。

**Q: 语音消息识别不准怎么办？**  
A: 配置火山引擎 STT 提升识别质量（`.env` 中设置 `VOLC_STT_APP_ID` 和 `VOLC_STT_ACCESS_TOKEN`）。

**Q: 定时任务如何设置？**  
A: 对话中说「每天 9 点推送热点」或「3 分钟后提醒我喝水」，AI 会自动创建。用 `/任务` 管理。

## 技术架构

```
手机钉钉 ─Stream→ dingtalk-cursor-claw ─CLI→ Cursor IDE
                         ↓
                  符号链接共享核心模块
                         ↓
              ┌──────────┴──────────┐
           bridge.ts             memory.ts
         (飞书版复用)          (飞书版复用)
```

## License

MIT
