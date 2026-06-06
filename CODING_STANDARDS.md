# 代码规范化现状与优化计划

## 当前配置

### 已实现

- [x] ESLint 9.x + Vue 插件 + TypeScript 插件 + JSDoc 插件
- [x] Prettier 格式化配置
- [x] Husky Git hooks（pre-push, commit-msg）
- [x] lint-staged（pre-commit 自动格式化）
- [x] CI 流程包含 lint、format、test、build 检查
- [x] TypeScript 严格模式
- [x] Commitlint（Conventional Commits）
- [x] EditorConfig

### 配置文件

- `eslint.config.js` - ESLint 配置
- `.lintstagedrc.json` - lint-staged 配置
- `.husky/pre-push` - Git pre-push 钩子
- `.husky/commit-msg` - Git commit-msg 钩子
- `.editorconfig` - 编辑器统一配置
- `commitlint.config.js` - Commit Message 规范
- `tsconfig.json` - TypeScript 严格模式

## 规范合理性分析

### ✅ 合理且必要的（企业标配）

| 规范                               | 配置文件               | 理由                             |
| ---------------------------------- | ---------------------- | -------------------------------- |
| **Commitlint**                     | `commitlint.config.js` | 统一提交格式，便于生成 changelog |
| **lint-staged**                    | `.lintstagedrc.json`   | 只检查暂存文件，速度快           |
| **EditorConfig**                   | `.editorconfig`        | 跨编辑器统一格式，轻量无侵入     |
| **TypeScript strict**              | `tsconfig.json`        | 类型安全，防 bug                 |
| **no-console / no-debugger**       | `eslint.config.js`     | 防止生产泄露                     |
| **eqeqeq / no-var / prefer-const** | `eslint.config.js`     | 现代 JS 最佳实践                 |
| **no-eval / no-with**              | `eslint.config.js`     | 安全和性能问题                   |

### ⚠️ 可能冗余的（建议后续移除）

| 规范                    | 问题                    | 建议           |
| ----------------------- | ----------------------- | -------------- |
| **arrow-parens**        | Prettier 已处理，重复   | 移除           |
| **no-new-object**       | TS 下很少出问题，收益低 | 移除           |
| **no-implicit-globals** | ES modules 下不可能发生 | 移除           |
| **complexity: 25**      | 阈值太高，失去约束意义  | 改为 15 或移除 |
| **max-params: 5**       | Vue 回调经常超 5 个参数 | 改为 7 或移除  |

### ❌ 缺少的（企业真正关注的）

| 规范                 | 重要性 | 说明                       |
| -------------------- | ------ | -------------------------- |
| **Import 排序**      | 高     | 减少合并冲突，统一导入顺序 |
| **测试覆盖率要求**   | 高     | 质量保证，防止回归         |
| **组件命名规范**     | 中     | 代码可读性                 |
| **API 错误处理规范** | 高     | 用户体验，统一错误提示     |

## 待优化项

### 1. 移除冗余 ESLint 规则

- [x] 移除 `arrow-parens`（Prettier 已处理）
- [x] 移除 `no-new-object`（收益低）
- [x] 移除 `no-implicit-globals`（ES modules 下不可能）
- [x] 调整 `complexity` 阈值为 15
- [x] 调整 `max-params` 阈值为 7

### 2. 添加 Import 排序

- [x] 安装 `eslint-plugin-simple-import-sort`
- [x] 配置导入排序规则
- [x] 自动修复所有文件导入顺序

### 3. 测试覆盖率要求

- [x] 配置 Vitest 覆盖率阈值（statements/lines: 65%, functions: 60%, branches: 55%）
- [x] 排除测试数据和配置文件
- [x] CI 流程包含覆盖率检查（`npm run ci:coverage`）

### 4. 组件命名规范

- [x] 组件名使用 PascalCase（已符合）
- [x] 单文件组件名与文件名一致（已符合）
- [x] 启用 `vue/multi-word-component-names` 规则（排除 App）
- [x] 修复命名：`Users.vue` → `UsersView.vue`，`Comments.vue` → `CommentsView.vue`

### 5. API 错误处理规范

- [x] 统一错误码定义（`ErrorCode` 枚举，25+ 种错误码）
- [x] 统一错误提示组件（`handleApiError` + ElMessage）
- [x] 网络错误重试机制（最多 2 次，间隔 1 秒）
- [x] Token 自动刷新机制
- [x] 错误上报（Sentry 集成）
- [x] 文档化规范（`docs/API_ERROR_HANDLING.md`）

### 6. JSDoc 注释完善

- [x] 配置 ESLint JSDoc 规则（warn 级别，不阻断 CI）
- [x] 创建文档规范（`docs/DOCUMENTATION_STANDARDS.md`）
- [x] 核心文件已有基础注释
- [x] 修复所有 52 个参数描述缺失 warnings
  - `src/utils/error-report.ts` - 5 个函数参数描述
  - `src/utils/format.ts` - 5 个函数参数描述
  - `src/utils/storage.ts` - 6 个函数参数描述
  - `src/composables/useErrorHandler.ts` - asyncFn 参数描述
  - `src/composables/useAuth.ts` - 函数描述和 @returns
  - `src/composables/usePagination.ts` - fetchFn/options 参数描述
  - `src/composables/useUpload.ts` - options 参数描述
  - `src/composables/useSearch.ts` - delay 参数描述
  - `src/composables/useDebounce.ts` - delay 参数描述优化

## 后续优化计划

> 以下按优先级排列，后续开发可逐项实施

### 7. TypeScript 严格性检查

- [ ] 检查 `any` 类型滥用（应使用 `unknown` 或具体类型）
- [ ] 消除 `@ts-ignore` / `@ts-nocheck` 注释
- [ ] 验证 `strictNullChecks` 生效情况（可选链/空值合并使用是否合理）
- [ ] 配置 `no-explicit-any` ESLint 规则（warn 级别）

### 8. Vue 组件规范检查

- [ ] 组件是否都有 `defineOptions({ name: 'xxx' })` 或 `<script setup>` 命名
- [ ] Props 是否都有类型定义和默认值
- [ ] Emits 是否都有类型声明
- [ ] 启用 `vue/no-unused-properties` 规则（检查未使用的 props/refs/computed）

### 9. API 层规范检查

- [ ] 所有 API 调用是否都有类型定义（请求参数/响应数据）
- [ ] 是否有硬编码的 URL（应使用环境变量或常量）
- [ ] 错误处理是否统一（是否还有组件内直接 try/catch 而未使用 `handleApiError`）
- [ ] 请求拦截器/响应拦截器是否完善

### 10. 样式规范检查

- [ ] 是否使用 scoped 样式（防止样式污染）
- [ ] 是否有硬编码的颜色值（应使用 CSS 变量）
- [ ] 是否有冗余的 CSS（未使用的样式）
- [ ] 配置 `stylelint` 进行样式检查

### 11. 性能相关检查

- [ ] 是否有未清理的定时器/事件监听器
- [ ] 大列表是否使用虚拟滚动
- [ ] 图片是否使用懒加载
- [ ] 路由是否配置懒加载
- [ ] 组件是否合理使用 `keep-alive`

### 12. 安全相关检查

- [ ] 是否有 XSS 风险（`v-html` 使用是否安全）
- [ ] 敏感信息是否硬编码（API 密钥、密钥等）
- [ ] Token 存储是否安全（localStorage vs httpOnly cookie）
- [ ] 配置 `eslint-plugin-security` 进行安全检查

### 13. 文档完整性检查

- [ ] 新增的 composables/utils 是否都有 JSDoc
- [ ] README 是否包含项目启动说明
- [ ] 环境变量是否有 `.env.example` 模板
- [ ] 是否有 CHANGELOG 自动生成配置

## 使用指南

### 开发流程

```bash
# 1. 创建分支
git checkout -b feat/your-feature

# 2. 开发代码
# ... 编写代码 ...

# 3. 提交前自动检查（lint-staged）
git add .
git commit -m "feat: your feature description"

# 4. 推送前检查（pre-push）
git push
```

### Commit Message 格式

```
<type>: <subject>

# type 可选值：
# feat     - 新功能
# fix      - 修复
# docs     - 文档
# style    - 格式（不影响代码运行）
# refactor - 重构
# perf     - 性能优化
# test     - 测试
# build    - 构建系统/依赖
# ci       - CI 配置
# chore    - 其他修改
# revert   - 回退

# 示例：
feat: 添加用户登录功能
fix: 修复 GitHub Pages 路由跳转问题
docs: 更新 README 安装说明
```

### CI/CD 检查项

- ✅ `npm run lint:check` - ESLint 检查
- ✅ `npm run format:check` - Prettier 格式检查
- ✅ `npm run test:run` - 单元测试
- ✅ `npm run build` - 构建检查

## 参考标准

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Vue.js Style Guide](https://vuejs.org/style-guide/)
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
