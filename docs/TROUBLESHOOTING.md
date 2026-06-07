# 常见问题排查

> 本文档记录 TeamGallery 项目常见问题和解决方案。

## 1. 开发环境问题

### 1.1 依赖安装失败

**问题**: `npm install` 报错

**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules 和 lock 文件
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

### 1.2 开发服务器启动失败

**问题**: `npm run dev` 报错

**排查步骤**:
1. 检查 Node.js 版本（需要 >= 18）
2. 检查端口是否被占用
3. 查看错误日志

```bash
# 检查 Node 版本
node -v

# 检查端口
netstat -ano | findstr :5173
```

### 1.3 TypeScript 类型错误

**问题**: IDE 显示类型错误但代码能运行

**解决方案**:
```bash
# 运行类型检查
npx vue-tsc --noEmit

# 重新生成类型声明
rm -rf node_modules/.vite
npm run dev
```

### 1.4 常见类型错误

| 错误 | 原因 | 修复 |
|------|------|------|
| `'_emit' is declared but its value is never read` | `defineEmits()` 返回值赋给变量但未使用 | 改为 `defineEmits()` 直接调用，不赋值 |
| `Generic type 'HttpResponse<BodyType>' requires 1 type argument(s)` | MSW v2 `HttpResponse` 需要泛型参数 | 移除显式返回类型注解，让 TypeScript 自动推断 |
| 组件导入路径报错 | 路径别名未配置或 tsconfig 未更新 | 检查 `@/` 别名在 `tsconfig.json` 中是否配置 |

## 2. 构建问题

### 2.1 构建失败

**问题**: `npm run build` 报错

**排查步骤**:
1. 运行类型检查
2. 运行 lint 检查
3. 查看详细错误信息

```bash
npm run lint
npx vue-tsc --noEmit
npm run build
```

### 2.2 构建产物过大

**问题**: 打包后文件过大

**优化方案**:
1. 检查依赖是否按需引入
2. 使用动态导入分割代码
3. 启用 Gzip 压缩

```bash
# 分析打包结果
npm run build -- --report
```

### 2.3 部署后 404

**问题**: 刷新页面出现 404

**原因**: SPA 路由需要服务器配置 fallback

**解决方案**: 配置 Nginx `try_files` 或使用 `404.html` fallback

详见 [DEPLOYMENT.md](./DEPLOYMENT.md)

## 3. 运行时问题

### 3.1 API 请求失败

**问题**: 网络请求报错

**排查步骤**:
1. 检查 `VITE_API_BASE_URL` 配置
2. 检查网络连接
3. 查看浏览器 Network 面板
4. 检查 CORS 配置

```typescript
// 检查环境变量
console.log(import.meta.env.VITE_API_BASE_URL)
```

### 3.2 Token 过期

**问题**: 请求返回 401

**解决方案**:
1. 自动刷新 Token（已实现）
2. 刷新失败跳转登录页
3. 检查 Token 存储位置

### 3.3 页面白屏

**问题**: 页面加载后显示空白

**排查步骤**:
1. 打开浏览器控制台查看错误
2. 检查路由配置
3. 检查组件导入路径
4. 确认 `src/test/setup.ts` 正确引入

## 4. 测试问题

### 4.1 测试运行失败

**问题**: `npm run test` 报错

**排查步骤**:
1. 确认 `src/test/setup.ts` 正确引入
2. 检查测试文件语法
3. 查看 Vitest 配置

```bash
# 运行单个测试文件
npm run test -- src/utils/error.test.ts

# 监听模式
npm run test:watch
```

### 4.2 覆盖率不达标

**问题**: CI 因覆盖率失败

**解决方案**:
1. 补充缺失的测试用例
2. 检查覆盖率阈值配置
3. 生成详细覆盖率报告

```bash
npm run test:coverage
```

## 5. 性能问题

### 5.1 页面加载慢

**优化方案**:
1. 使用动态导入分割代码
2. 图片懒加载
3. 启用 Gzip 压缩
4. 使用 CDN 加速

### 5.2 列表渲染慢

**优化方案**:
1. 使用虚拟滚动（超过 100 项）
2. 分页加载
3. 避免不必要的响应式更新

## 6. Git 问题

### 6.1 Commit 被拒绝

**问题**: Commit message 格式错误

**解决方案**: 遵循 Conventional Commits 规范

```bash
# 正确格式
feat: 添加新功能
fix: 修复 bug
docs: 更新文档
```

### 6.2 Pre-commit Hook 失败

**问题**: 提交前 lint 检查失败

**解决方案**:
```bash
# 运行 lint 修复
npm run lint
npm run lint:style

# 跳过 hook（不推荐）
git commit --no-verify
```

## 7. 其他资源

- 查看 [代码规范](./CODING_STANDARDS.md)
- 查看 [架构文档](./ARCHITECTURE.md)
- 查看 [测试指南](./TESTING.md)
- 查看 [安全策略](./SECURITY.md)
- 提交 Issue 到项目仓库
