# 贡献指南

感谢你考虑为 CursorClaw 做出贡献！

## 如何贡献

### 报告 Bug

如果你发现 Bug，请[创建 Issue](../../issues/new)并提供以下信息：

1. **问题描述**：清晰简洁地描述问题
2. **重现步骤**：
   - 你做了什么操作
   - 发送了什么消息
   - 期望的结果
   - 实际的结果
3. **环境信息**：
   ```bash
   sw_vers              # macOS 版本
   bun --version        # Bun 版本
   agent --version      # Cursor CLI 版本
   ```
4. **错误日志**：
   ```bash
   cd feishu && bash service.sh logs | tail -50
   # 或
   cd dingtalk && bash service.sh logs | tail -50
   # 或
   cd wecom && bash service.sh logs | tail -50
   ```
5. **配置信息**（脱敏后）：
   - `projects.json` 内容
   - `.env` 中的模型配置（隐藏 Key 和 Secret）

### 提出功能建议

我们欢迎功能建议！请[创建 Issue](../../issues/new)并说明：

1. **功能描述**：你希望添加什么功能
2. **使用场景**：为什么需要这个功能
3. **预期行为**：功能应该如何工作
4. **备选方案**：是否考虑过其他实现方式

### 贡献代码

我们热烈欢迎 Pull Request！

#### 开发流程

1. **Fork 项目**

   点击页面右上角的 "Fork" 按钮。

2. **克隆你的 Fork**

   ```bash
   git clone https://github.com/keunsy/cursorclaw.git
   cd cursorclaw
   ```

3. **创建功能分支**

   ```bash
   git checkout -b feature/your-feature-name
   ```

   分支命名规范：
   - `feature/` - 新功能
   - `fix/` - Bug 修复
   - `docs/` - 文档更新
   - `refactor/` - 代码重构
   - `test/` - 测试相关

4. **安装开发依赖**

   ```bash
   # 安装飞书依赖
   cd feishu && bun install
   
   # 安装钉钉依赖
   cd ../dingtalk && bun install
   
   # 安装企业微信依赖
   cd ../wecom && bun install
   ```

5. **配置开发环境**

   参考 [DEVELOPMENT.md](docs/DEVELOPMENT.md)

6. **进行开发**

   - 遵循项目代码规范（见下文）
   - 添加必要的注释
   - 编写或更新测试
   - 更新相关文档

7. **测试你的更改**

   ```bash
   # 运行测试
   bun test
   
   # 手动测试
   cd feishu && bun run server.ts
   # 在飞书、钉钉或企业微信中发送测试消息
   ```

8. **提交更改**

   遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

   ```bash
   git add .
   git commit -m "feat: 添加文件发送功能"
   ```

   Commit 消息格式：
   ```
   <类型>: <描述>
   
   [可选的详细说明]
   
   [可选的 Issue 引用]
   ```

   类型：
   - `feat` - 新功能
   - `fix` - Bug 修复
   - `docs` - 文档更新
   - `style` - 代码格式（不影响功能）
   - `refactor` - 代码重构
   - `test` - 测试相关
   - `chore` - 构建/工具相关

   示例：
   ```bash
   git commit -m "feat: 添加钉钉文件发送支持

   - 实现文件上传接口
   - 添加文件大小检查（最大 30MB）
   - 支持多种文件格式

   Closes #123"
   ```

9. **推送到你的 Fork**

   ```bash
   git push origin feature/your-feature-name
   ```

10. **创建 Pull Request**

    - 访问你的 Fork 页面
    - 点击 "New Pull Request"
    - 选择你的功能分支
    - 填写 PR 描述（见下文）

#### Pull Request 规范

**PR 标题**：

```
<类型>: <简短描述>
```

例如：
```
feat: 添加钉钉文件发送功能
fix: 修复语音识别失败问题
docs: 更新 README 安装步骤
```

**PR 描述模板**：

```markdown
## 变更类型

- [ ] 新功能 (feature)
- [ ] Bug 修复 (fix)
- [ ] 文档更新 (docs)
- [ ] 代码重构 (refactor)
- [ ] 测试 (test)
- [ ] 其他 (chore)

## 变更说明

清晰描述你做了什么改动。

## 关联 Issue

Closes #123

## 测试

说明如何测试你的更改：

1. 启动服务：`cd feishu && bun run server.ts`
2. 发送消息：`你好`
3. 预期结果：收到回复

## 截图（可选）

如果是 UI 相关变更，请提供截图。

## 检查清单

- [ ] 代码遵循项目规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 已添加/更新测试
- [ ] 所有测试通过
- [ ] 本地测试无问题
```

## 代码规范

### TypeScript 风格

```typescript
// ✅ 好的实践
export async function processMessage(
  message: string,
  options?: ProcessOptions
): Promise<string> {
  if (!message) {
    throw new Error('消息不能为空');
  }
  
  const result = await doSomething(message);
  return result;
}

// ❌ 避免
async function processMessage(message) {  // 缺少类型
  return await doSomething(message);      // 不必要的 await
}
```

### 命名规范

- **变量和函数**：驼峰命名（camelCase）
  ```typescript
  const userName = 'Alice';
  function getUserInfo() {}
  ```

- **类和接口**：帕斯卡命名（PascalCase）
  ```typescript
  class UserManager {}
  interface UserInfo {}
  ```

- **常量**：大写蛇形命名（UPPER_SNAKE_CASE）
  ```typescript
  const MAX_RETRY_COUNT = 3;
  const API_BASE_URL = 'https://api.example.com';
  ```

- **文件名**：短横线命名（kebab-case）
  ```
  user-manager.ts
  message-handler.ts
  ```

### 注释规范

```typescript
/**
 * 处理用户消息
 * 
 * @param message - 用户发送的消息内容
 * @param userId - 用户 ID
 * @returns 处理结果
 * @throws {Error} 当消息为空时抛出错误
 */
export async function handleMessage(
  message: string,
  userId: string
): Promise<string> {
  // 验证输入
  if (!message.trim()) {
    throw new Error('消息不能为空');
  }
  
  // 处理消息
  const result = await processMessage(message);
  
  // 返回结果
  return result;
}
```

**注释原则**：
- ✅ 解释"为什么"这样做（非显而易见的逻辑）
- ✅ 说明复杂算法的思路
- ✅ 标注已知问题和 TODO
- ❌ 不要复述代码（`// 调用函数` 这种无用注释）

### 错误处理

```typescript
// ✅ 好的实践
try {
  const result = await riskyOperation();
  return result;
} catch (error) {
  console.error('[模块名] 操作失败:', error);
  throw new Error(`操作失败: ${error.message}`);
}

// ✅ 使用自定义错误
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

if (!isValid(data)) {
  throw new ValidationError('数据验证失败');
}

// ❌ 避免
try {
  await riskyOperation();
} catch (error) {
  // 吞掉错误，什么都不做
}
```

### 日志规范

```typescript
// 使用统一的日志前缀
console.log('[Feishu] 收到消息:', messageId);
console.error('[Feishu] 处理失败:', error);

// 不同级别
console.log('INFO: 正常信息');
console.warn('WARN: 警告信息');
console.error('ERROR: 错误信息');
```

### 异步处理

```typescript
// ✅ 好的实践：并发执行独立任务
const [userInfo, projectInfo] = await Promise.all([
  getUserInfo(userId),
  getProjectInfo(projectId),
]);

// ✅ 好的实践：串行执行依赖任务
const user = await getUser(userId);
const profile = await getUserProfile(user.id);

// ❌ 避免：串行执行独立任务（浪费时间）
const userInfo = await getUserInfo(userId);
const projectInfo = await getProjectInfo(projectId);
```

## 测试规范

### 单元测试

```typescript
// shared/utils.test.ts
import { test, expect } from 'bun:test';
import { parseProjectRoute } from './utils';

test('parseProjectRoute - 正常情况', () => {
  const result = parseProjectRoute('test: 你好');
  expect(result.project).toBe('test');
  expect(result.message).toBe('你好');
});

test('parseProjectRoute - 无项目前缀', () => {
  const result = parseProjectRoute('你好');
  expect(result.project).toBe('default');
  expect(result.message).toBe('你好');
});
```

### 集成测试

```typescript
// tests/integration/message-flow.test.ts
import { test, expect } from 'bun:test';
import { startServer, sendMessage, stopServer } from './helpers';

test('完整消息流程', async () => {
  // 启动服务
  const server = await startServer();
  
  try {
    // 发送消息
    const response = await sendMessage('你好');
    
    // 验证响应
    expect(response).toContain('你好');
    expect(response.length).toBeGreaterThan(0);
  } finally {
    // 清理
    await stopServer(server);
  }
});
```

## 文档规范

### 更新文档

代码变更时，请同步更新相关文档：

- **README.md** - 功能概述、快速开始
- **feishu/README.md** - 飞书服务详细说明
- **dingtalk/README.md** - 钉钉服务详细说明
- **wecom/README.md** - 企业微信服务详细说明
- **docs/ARCHITECTURE.md** - 架构设计
- **docs/DEVELOPMENT.md** - 开发指南
- **docs/TROUBLESHOOTING.md** - 故障排查
- **CHANGELOG.md** - 变更日志

### Markdown 规范

```markdown
# 一级标题

简短的描述段落。

## 二级标题

### 三级标题

- 列表项 1
- 列表项 2

**加粗文本**  
*斜体文本*  
`代码`

\```bash
# 代码块
echo "Hello"
\```

| 列 1 | 列 2 |
|------|------|
| 值 1 | 值 2 |
```

## Git 工作流

### 分支管理

```
main
  ├── feature/user-authentication
  ├── fix/voice-recognition
  └── docs/update-readme
```

- `main` - 稳定分支，仅接受 PR
- `feature/*` - 新功能分支
- `fix/*` - Bug 修复分支
- `docs/*` - 文档分支

### Commit 规范

**好的 Commit**：

```bash
feat: 添加钉钉文件发送功能

- 实现文件上传接口
- 添加文件大小检查
- 支持多种文件格式
```

**不好的 Commit**：

```bash
Update code
Fix bug
WIP
```

## Review 流程

### 提交 PR 后

1. **自动检查**：GitHub Actions 会自动运行测试
2. **代码审查**：维护者会审查你的代码
3. **反馈修改**：根据反馈修改代码
4. **合并**：通过审查后合并到 `main`

### 审查标准

我们会检查：

- [ ] 代码质量
- [ ] 测试覆盖
- [ ] 文档完整性
- [ ] 兼容性（不破坏现有功能）
- [ ] 性能影响
- [ ] 安全性

## 社区准则

### 行为规范

我们致力于创建一个友好、包容的社区：

- ✅ 尊重不同观点和经验
- ✅ 接受建设性批评
- ✅ 关注对社区最有利的事情
- ✅ 对其他社区成员表示同理心
- ❌ 不使用性别化语言或图像
- ❌ 不进行人身攻击或政治攻击
- ❌ 不公开或私下骚扰

### 沟通方式

- **Issue**：报告 Bug、提出功能建议
- **Pull Request**：贡献代码
- **Discussions**：技术讨论、提问

## 许可证

贡献的代码将采用 [MIT License](LICENSE) 开源。

提交 PR 即表示你同意将代码以 MIT License 授权。

## 感谢

感谢你的贡献！每一个 PR、Issue、甚至 Star 都是对我们的支持。

特别感谢：
- [@nongjun](https://github.com/nongjun) - 原始项目 [feishu-cursor-claw](https://github.com/nongjun/feishu-cursor-claw) 作者
- 所有贡献者

---

## 快速参考

### 完整工作流示例

```bash
# 1. Fork 并克隆
git clone https://github.com/keunsy/cursorclaw.git
cd cursorclaw

# 2. 创建分支
git checkout -b feature/my-feature

# 3. 开发
# 编写代码...

# 4. 测试
bun test
cd feishu && bun run server.ts  # 手动测试

# 5. 提交
git add .
git commit -m "feat: 添加新功能"

# 6. 推送
git push origin feature/my-feature

# 7. 创建 PR
# 访问 GitHub 创建 Pull Request

# 8. 根据反馈修改
git add .
git commit -m "fix: 根据反馈修改"
git push origin feature/my-feature

# 9. 合并后同步
git checkout main
git pull upstream main
git push origin main
```

### 常用命令

```bash
# 安装依赖
cd feishu && bun install
cd dingtalk && bun install

# 运行服务
cd feishu && bun run server.ts

# 运行测试
bun test

# 查看日志
cd feishu && bash service.sh logs

# 格式化代码（如果有配置）
bun run format

# 检查代码（如果有配置）
bun run lint
```

---

再次感谢你的贡献！如有任何问题，欢迎在 Issue 中提问。
