# 配置目录说明

## 文件说明

| 文件 | 用途 | Git追踪 | 默认平台数 | 推荐 |
|------|------|---------|-----------|------|
| `news-sources.json` | **生效配置**（私人） | ❌ 不提交 | - | - |
| `news-sources.json.example` | **简要版**（推荐） | ✅ 提交 | 4个 | ⭐⭐⭐ |
| `news-sources.full.json.example` | 完整版 | ✅ 提交 | 15个 | ⭐⭐ |
| `news-sources.advanced.json.example` | 高级版（自定义排序） | ✅ 提交 | 15个 | ⭐ |

## 首次使用（推荐简要版）

```bash
# 复制简要版（推荐）- 默认4个核心平台
cp config/news-sources.json.example config/news-sources.json

# 或者使用完整版 - 15个平台全开
cp config/news-sources.full.json.example config/news-sources.json

# 或者使用高级版 - 自定义排序和条数
cp config/news-sources.advanced.json.example config/news-sources.json
```

## 版本区别

### 简要版（推荐）
- **平台**: 微博、知乎、GitHub、百度（4个）
- **配置**: `"preset": "brief"`
- **特点**: 精简高效，只保留核心渠道
- **适合**: 大部分用户日常使用

### 完整版
- **平台**: 15个全部平台
- **配置**: `"preset": "full"`
- **特点**: 全面覆盖，资讯最丰富
- **适合**: 需要全面了解各领域热点

### 高级版
- **平台**: 自定义
- **配置**: 使用 `"platforms": [...]` 或 `"platformOrder": [...]`
- **特点**: 完全自定义平台列表、排序和条数
- **适合**: 个性化需求

## 配置生效规则

代码读取 `config/news-sources.json`，按以下优先级：

1. **本地文件** `config/news-sources.json`（如果存在）
2. **代码内置默认配置**（如果文件不存在）

## 个性化配置

### 方式1：切换预设版本（推荐）

只需修改 `config/news-sources.json` 中的 `preset` 字段：

```json
{
  "sources": [{
    "config": {
      "preset": "brief"  // 改成 "full" 就切换到完整版
    }
  }]
}
```

### 方式2：自定义预设平台列表

修改 `presets` 对象，可以自定义 brief 和 full 包含哪些平台：

```json
{
  "presets": {
    "brief": ["weibo", "zhihu", "github", "baidu"],  // 自定义简要版
    "full": ["weibo", "zhihu", "v2ex", "juejin"]     // 自定义完整版
  }
}
```

### 方式3：完全自定义

使用 `news-sources.advanced.json.example` 作为起点，自定义平台列表。

配置文件**不会提交到仓库**，不影响别人。

**可用平台**：抖音热搜、微博热搜、今日头条、知乎热榜、V2EX、百度热搜、36氪、IT之家等 10+ 个数据源。详见配置文件注释。
