# 变更日志

本文件记录本项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [Unreleased]

### 重构 - 2026-03-19

- **记忆系统统一化** - 将三个平台的 `memory-tool.ts` 统一到 `shared/memory-tool.ts`
  - 总代码从 447 行减少到 243 行（-204 行，-46%）
  - 消除 298 行重复代码（重复率从 67% 降到 0%）
  - 维护点从 3 处降到 1 处（-67%）
  - 通过智能平台检测实现零破坏性迁移
  - 各平台保留 23 行轻量级包装脚本，保持向后兼容
  - 详见：[REFACTOR-SUMMARY.md](REFACTOR-SUMMARY.md) 和 [docs/记忆系统统一重构.md](docs/记忆系统统一重构.md)

### 修复 - 2026-03-19

- **[关键] 记忆系统包装脚本 Bug 修复** - 修复平台识别错误
  - Bug 1: 飞书包装脚本注释错误（写成"钉钉"）
  - Bug 2: 飞书包装脚本平台设置错误（`CURSOR_PLATFORM = "dingtalk"` 应为 `"feishu"`）
  - Bug 3: 钉钉文件是符号链接，指向飞书脚本，导致平台识别错误
  - 修复方法：删除符号链接，创建独立的包装脚本
  - 影响：修复前可能导致读取错误的 `.env` 配置文件
  - 详见：[Bug 修复报告](docs/bug-fix-report-2026-03-19.md)

- **[重要] 企业微信文档更新** - 修复 README 严重过时问题
  - 发现：README 声称"完整命令系统"处于"开发中"，实际已完全实现
  - 影响：用户误以为企业微信功能不完整，可能放弃使用
  - 修复：更新 `wecom/README.md` 和 `wecom/AGENTS.md`，准确反映 v1.1 功能状态
  - 实际状态：13 个核心命令全部实现，流式回复体验优于飞书
  - 详见：[企业微信问题报告](docs/wecom-issues-report-2026-03-19.md)

- **企业微信接入补全** - 修复企业微信缺失文件
  - 创建 `cron-jobs-wecom.json` 定时任务配置文件
  - 添加 `wecom/memory-tool.ts` 记忆工具（现已统一到 shared）
  - 企业微信服务现已完全可用

### 改进

- **热点推送消息样式优化**：全新的视觉设计，提升可读性和美观度
  - 标题使用数字格式（**1.**, **2.**）替代 emoji，更简洁
  - 热度值优化为 ` · 🔥 123.4万热` 格式，移除反引号
  - 平台区块添加分隔线 `━━━━━━━━━━━━━━━━━━━━━━` 和新的 emoji 🌟
  - 链接简化为 `[→ 查看原文]` 格式
  - 优化整体排版间距，提升内容呼吸感
  - 支持新旧样式切换（配置项 `useEnhancedStyle`，默认启用新样式）

---

## [2.0.0] - 2026-03-14

基于 [feishu-cursor-claw](https://github.com/nongjun/feishu-cursor-claw) 进行大量改进和扩展。

### 新增

- **钉钉渠道支持**：完整支持钉钉 Stream 长连接
- **企业微信渠道支持**：完整支持企业微信 WebSocket 长连接
- **三服务架构**：飞书、钉钉、企业微信独立部署，可同时运行、互不干扰
- **统一服务管理**：根目录 `manage-services.sh` 统一查看/重启/查看日志
- **配置文件分离**：每个服务独立 `.env`、独立 `cron-jobs-*.json`
- **共享项目路由**：根目录 `projects.json` 被三个平台共同使用
- **企业微信支持**：WebSocket 长连接，主动推送流式回复，延迟更低

### 变更

- **目录结构**：飞书代码迁入 `feishu/`，钉钉代码迁入 `dingtalk/`，企业微信代码迁入 `wecom/`
- **定时任务**：飞书使用 `cron-jobs-feishu.json`，钉钉使用 `cron-jobs-dingtalk.json`，企业微信使用 `cron-jobs-wecom.json`
- **环境变量**：各服务独立 `.env`，平台隔离更清晰

### 致谢

- 原项目 [feishu-cursor-claw](https://github.com/nongjun/feishu-cursor-claw) 作者 [@nongjun](https://github.com/nongjun)

---

## [1.x] - 原项目

功能与版本以原仓库 [feishu-cursor-claw](https://github.com/nongjun/feishu-cursor-claw) 为准，本项目自 2.0.0 起在其基础上演进。

[Unreleased]: https://github.com/keunsy/cursorclaw/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/keunsy/cursorclaw/releases/tag/v2.0.0
