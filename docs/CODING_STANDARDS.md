# 代码规范

> 本文档定义 TeamGallery 前端应用的代码规范，所有开发者必须遵守。

| 项目 | 值 |
|------|-----|
| 适用 | 前端应用 |
| 最后更新 | 2026-06-08 |

## 目录

## 1. 工具链配置
## 2. 代码风格
## 3. 文档规范
## 4. API 错误处理
## 5. 样式规范
## 6. 性能规范
## 7. 安全规范
## 8. 测试规范
## 9. Commit 规范
## 10. CI/CD 检查项
## 相关文档

---

## 1. 工具链配置

### 1.1 ESLint

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 插件 | `eslint-plugin-vue`, `@typescript-eslint`, `eslint-plugin-security`, `eslint-plugin-import` | 代码质量检查 |
| 规则 | `vue/essential`, `vue/strongly-recommended`, `vue/recommended` | Vue 规则分级 |
| 安全规则 | `security/detect-object-injection`, `security/detect-non-literal-require` | 安全漏洞检测 |

### 1.2 Prettier

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `semi` | `false` | 不使用分号 |
| `singleQuote` | `true` | 使用单引号 |
| `trailingComma` | `all` | 尾随逗号 |
| `printWidth` | `100` | 行宽限制 |

### 1.3 Stylelint

| 配置项 | 值 | 说明 |
|--------|-----|------|
| `extends` | `stylelint-config-standard`, `stylelint-config-recommended-vue` | 标准配置 |
| `rules` | `color-hex-length: short`, `declaration-block-no-duplicate-properties: true` | 样式规则 |

### 1.4 Commitlint

| 规则 | 说明 |
|------|------|
| `type-enum` | `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert` |
| `subject-case` | 小写开头，不超过 72 字符 |

### 1.5 Husky + lint-staged

| Hook | 命令 | 说明 |
|------|------|------|
| `pre-commit` | `lint-staged` | 提交前自动 lint + format |
| `commit-msg` | `commitlint --edit` | 检查 commit message 格式 |
| `pre-push` | `npm run lint` | 推送前全量检查 |

## 2. 代码风格

### 2.1 导入排序

使用 `eslint-plugin-import` 自动排序：

```typescript
// 1. 外部依赖（按字母排序）
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'

// 2. 空行分隔

// 3. 内部模块（按字母排序）
import { getArticles } from '@/api/article'
import type { Article } from '@/types'
import { useAuth } from '@/composables'
```

### 2.2 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件文件 | PascalCase | `ArticleList.vue` |
| 工具函数 | camelCase | `formatDate.ts` |
| 类型定义 | PascalCase | `Article.ts` |
| 常量 | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| CSS 类 | kebab-case | `article-card` |

### 2.3 组件规范

- 使用 `<script setup lang="ts">` 语法
- Props 必须定义类型
- 事件使用 `defineEmits` 声明（不赋值给变量，直接调用）
- 样式必须使用 `scoped`

```vue
<script setup lang="ts">
// 正确：直接调用 defineEmits，不赋给变量
defineEmits<{
  submit: [data: FormData]
  cancel: []
}>()

// 错误：赋给未使用的变量
// const _emit = defineEmits<{ submit: [data: FormData] }>()
</script>
```

### 2.4 JSDoc 注释

所有导出的公共函数必须添加 JSDoc 注释：

```typescript
/**
 * 获取文章列表
 * @param params - 查询参数
 * @param params.page - 页码，默认 1
 * @param params.page_size - 每页数量，默认 10
 * @returns 文章列表响应
 * @throws {ApiError} 网络错误或服务器错误
 * @example
 * const articles = await getArticles({ page: 1 })
 */
export const getArticles = (params: ArticleListParams): Promise<ApiResponse<PaginatedResponse<Article>>> => {
  return request.get('/articles', { params })
}
```

## 3. 文档规范

### 3.1 文档位置

| 文档类型 | 位置 | 说明 |
|---------|------|------|
| README.md | 根目录 | 项目入口 |
| LICENSE | 根目录 | 开源许可证 |
| CHANGELOG.md | 根目录 | 版本变更 |
| 技术文档 | `docs/` 目录 | 架构、API、部署等 |

### 3.2 文档格式

- 使用 Markdown 格式
- 标题使用 ATX 风格（`#`）
- 代码块指定语言
- 表格使用管道符对齐

### 3.3 文档更新

- 代码变更时同步更新相关文档
- API 变更必须更新 `docs/API_DOCUMENTATION.md`
- 架构变更必须更新 `docs/ARCHITECTURE.md`

## 4. API 错误处理

### 4.1 统一响应格式

```typescript
interface ApiResponse<T> {
  code: number       // 0 表示成功，其他表示错误
  message: string    // 提示信息
  data: T           // 响应数据
}
```

### 4.2 错误码规范

| 错误码 | 说明 | 前端处理 |
|--------|------|---------|
| `0` | 成功 | 正常处理 |
| `400` | 请求参数错误 | 提示用户检查输入 |
| `401` | 未授权/Token 过期 | 跳转登录页 |
| `403` | 权限不足 | 提示权限不足 |
| `404` | 资源不存在 | 提示资源不存在 |
| `429` | 请求过于频繁 | 提示稍后重试 |
| `500` | 服务器错误 | 提示服务器错误 |

### 4.3 错误处理函数

```typescript
// src/utils/error.ts
export const handleApiError = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    switch (status) {
      case 401:
        router.push('/login')
        break
      case 403:
        ElMessage.error('权限不足')
        break
      default:
        ElMessage.error('请求失败')
    }
  }
}
```

### 4.4 错误类型定义

```typescript
// src/types/api.ts
export enum ErrorCode {
  // 通用错误
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  
  // 认证错误
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  
  // 业务错误
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  ARTICLE_NOT_FOUND = 'ARTICLE_NOT_FOUND',
  FILE_UPLOAD_FAILED = 'FILE_UPLOAD_FAILED',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED = 'FILE_TYPE_NOT_ALLOWED',
  DATABASE_ERROR = 'DATABASE_ERROR',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
}
```

## 5. 样式规范

### 5.1 Scoped 样式

- 所有组件必须使用 `<style scoped>`
- 避免使用深度选择器（`::v-deep`）
- 需要全局样式时使用 `:global()` 或提取到 `variables.css`

### 5.2 CSS 变量

所有颜色、尺寸、字体等设计令牌必须使用 CSS 变量：

```css
/* src/assets/styles/variables.css */
:root {
  /* 颜色 */
  --color-primary: #1890ff;
  --color-success: #52c41a;
  --color-warning: #faad14;
  --color-error: #ff4d4f;
  
  /* 尺寸 */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  
  /* 字体 */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  
  /* 圆角 */
  --border-radius-sm: 2px;
  --border-radius-base: 4px;
  --border-radius-lg: 8px;
}
```

### 5.3 Stylelint 规则

| 规则 | 说明 |
|------|------|
| `color-hex-length: short` | 颜色使用简写 |
| `declaration-block-no-duplicate-properties` | 禁止重复属性 |
| `property-no-vendor-prefix` | 禁止浏览器前缀 |
| `value-no-vendor-prefix` | 禁止值前缀 |

## 6. 性能规范

### 6.1 虚拟滚动

列表超过 100 项时必须使用虚拟滚动：

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { usePagination } from '@/composables'

const { items, loadMore, hasMore } = usePagination({
  fetchFn: getArticles,
  pageSize: 20,
  threshold: 200 // 距离底部 200px 时加载
})
</script>

<template>
  <div class="article-list">
    <div v-for="item in items" :key="item.id" class="article-item">
      {{ item.title }}
    </div>
    <div v-if="hasMore" class="load-more" @click="loadMore">
      加载更多
    </div>
  </div>
</template>
```

### 6.2 懒加载

- 图片使用 `loading="lazy"`
- 路由组件使用动态导入
- 大型组件按需加载

### 6.3 Keep-Alive

需要缓存的页面使用 `<keep-alive>`：

```vue
<router-view v-slot="{ Component }">
  <keep-alive :include="['ArticleListView', 'SearchView']">
    <component :is="Component" />
  </keep-alive>
</router-view>
```

## 7. 安全规范

### 7.1 XSS 防护

- 使用 `v-html` 时必须通过 `sanitize.ts` 过滤
- 用户输入必须转义
- URL 参数必须验证

```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify'

export const sanitize = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel']
  })
}
```

### 7.2 Token 存储

- Access Token 存储在 `sessionStorage`
- Refresh Token 存储在 `httpOnly` Cookie（后端设置）
- 禁止将 Token 存储在 `localStorage`

### 7.3 安全扫描

- 使用 `eslint-plugin-security` 检测安全漏洞
- CI 流程包含安全扫描步骤
- 定期更新依赖包修复已知漏洞

## 8. 测试规范

### 8.1 测试框架

| 工具 | 用途 |
|------|------|
| Vitest | 单元测试 |
| Vue Test Utils | Vue 组件测试 |
| MSW | API Mock |

### 8.2 测试文件命名

- 测试文件：`*.test.ts` 或 `*.spec.ts`
- 测试文件与源文件同级目录
- 例如：`src/utils/error.ts` → `src/utils/error.test.ts`

### 8.3 覆盖率要求

| 指标 | 阈值 |
|------|------|
| Statements | ≥ 65% |
| Lines | ≥ 65% |
| Functions | ≥ 60% |
| Branches | ≥ 55% |

## 9. Commit 规范

### 9.1 Commit Message 格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 9.2 Type 说明

| Type | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码格式（不影响功能） |
| `refactor` | 重构 |
| `test` | 测试相关 |
| `chore` | 构建/工具变更 |
| `perf` | 性能优化 |
| `ci` | CI 配置变更 |

### 9.3 示例

```
feat(article): 添加文章列表虚拟滚动

- 使用 usePagination 组合式函数
- 实现滚动加载
- 添加加载状态提示

Closes #123
```

## 10. CI/CD 检查项

### 10.1 检查项

| 检查项 | 命令 | 说明 |
|--------|------|------|
| Type check | `npx vue-tsc --noEmit` | TypeScript 类型检查 |
| Style lint | `npm run lint:style:check` | 样式检查 |
| CI check | `npm run ci:coverage` | lint + format + test + coverage + build |

> CI 配置详见 `.github/workflows/ci.yml`，支持 Node.js 18/20 矩阵测试。

### 10.2 本地验证

提交前运行：

```bash
npm run ci:coverage
```

确保所有检查通过后再提交。

## 相关文档

- [架构设计](./ARCHITECTURE.md)
- [测试指南](./TESTING.md)
- [开发指南](./DEVELOPMENT.md)
