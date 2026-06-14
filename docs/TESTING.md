# 测试指南

> 本文档描述 TeamGallery 前端应用的测试规范和最佳实践。

| 项目 | 值 |
|------|-----|
| 适用 | 前端应用 |
| 最后更新 | 2026-06-08 |

## 目录

## 1. 测试框架
## 2. 测试配置
## 3. 测试文件组织
## 4. 单元测试
## 5. 组件测试
## 6. API Mock
## 7. 运行测试
## 8. 测试最佳实践
## 相关文档

---

## 1. 测试框架

| 工具 | 版本 | 用途 |
|------|------|------|
| Vitest | 3.x | 单元测试框架 |
| Vue Test Utils | 2.x | Vue 组件测试 |
| MSW | 2.x | API Mock |
| Happy DOM | - | DOM 环境 |

## 2. 测试配置

### 2.1 Vitest 配置

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        statements: 65,
        lines: 65,
        functions: 60,
        branches: 55
      }
    }
  }
})
```

### 2.2 测试环境初始化

```typescript
// src/test/setup.ts
import { config } from '@vue/test-utils'

// 全局 Mock
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

// Mock Vue Router
config.global.mocks = {
  $router: { push: vi.fn() },
  $route: { params: {}, query: {} }
}
```

## 3. 测试文件组织

### 3.1 命名规范

- 测试文件：`*.test.ts` 或 `*.spec.ts`
- 与源文件同级目录
- 例如：`src/utils/error.ts` → `src/utils/error.test.ts`

### 3.2 目录结构

```
src/
├── utils/
│   ├── error.ts
│   └── error.test.ts
├── composables/
│   ├── useAuth.ts
│   └── useAuth.test.ts
├── stores/
│   ├── user.ts
│   └── user.test.ts
└── test/
    └── setup.ts
```

## 4. 单元测试

### 4.1 工具函数测试

```typescript
// src/utils/format.test.ts
import { describe, it, expect } from 'vitest'
import { formatDate, formatNumber } from './format'

describe('formatDate', () => {
  it('应该正确格式化日期', () => {
    expect(formatDate('2024-01-01')).toBe('2024年1月1日')
  })

  it('应该处理无效日期', () => {
    expect(formatDate('invalid')).toBe('')
  })
})
```

### 4.2 Composable 测试

```typescript
// src/composables/useAuth.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useAuth } from './useAuth'

describe('useAuth', () => {
  it('应该正确登录', async () => {
    const { login, user } = useAuth()
    
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ user: { id: '1', username: 'test' } })
    } as Response)

    await login('test', 'password')
    expect(user.value?.username).toBe('test')
  })
})
```

### 4.3 Store 测试

```typescript
// src/stores/user.test.ts
import { describe, it, expect } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useUserStore } from './user'

describe('useUserStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('应该正确设置用户信息', () => {
    const store = useUserStore()
    store.setUser({ id: '1', username: 'test' })
    expect(store.user?.username).toBe('test')
  })
})
```

## 5. 组件测试

### 5.1 基础组件测试

```typescript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AppHeader from '@/components/layout/AppHeader.vue'

describe('AppHeader', () => {
  it('应该正确渲染标题', () => {
    const wrapper = mount(AppHeader)
    expect(wrapper.text()).toContain('TeamGallery')
  })
})
```

### 5.2 交互测试

```typescript
it('点击登录按钮应该跳转登录页', async () => {
  const wrapper = mount(AppHeader, {
    global: {
      mocks: {
        $router: { push: vi.fn() }
      }
    }
  })
  
  await wrapper.find('.login-btn').trigger('click')
  expect(wrapper.global.$router.push).toHaveBeenCalledWith('/login')
})
```

## 6. API Mock

### 6.1 MSW 配置

```typescript
// src/mocks/handlers/article.ts
import { http, HttpResponse } from 'msw'

export const articleHandlers = [
  http.get('/v1/articles', () => {
    return HttpResponse.json({
      code: 0,
      data: {
        items: [
          { id: '1', title: 'Test Article' }
        ],
        total: 1
      }
    })
  })
]
```

### 6.2 测试中使用 Mock

```typescript
import { setupServer } from 'msw/node'
import { articleHandlers } from '@/mocks/handlers/article'

const server = setupServer(...articleHandlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 7. 运行测试

### 7.1 常用命令

| 命令 | 说明 |
|------|------|
| `npm run test` | 运行所有测试 |
| `npm run test:watch` | 监听模式 |
| `npm run test:coverage` | 生成覆盖率报告 |
| `npm run test:ui` | 打开 UI 界面 |

### 7.2 CI 中的测试

- CI 流程自动运行测试
- 覆盖率不达标时构建失败
- 生成覆盖率报告供查看

## 8. 测试最佳实践

### 8.1 测试原则

- 测试行为，不是实现
- 每个测试独立
- 使用 Arrange-Act-Assert 模式
- Mock 外部依赖

### 8.2 覆盖率要求

| 指标 | 阈值 |
|------|------|
| Statements | ≥ 65% |
| Lines | ≥ 65% |
| Functions | ≥ 60% |
| Branches | ≥ 55% |

### 8.3 常见陷阱

- 不要测试框架代码
- 不要 Mock 所有内容
- 避免测试实现细节
- 确认 `src/test/setup.ts` 正确引入

## 相关文档

- [代码规范](./CODING_STANDARDS.md)
- [开发指南](./DEVELOPMENT.md)
- [架构设计](./ARCHITECTURE.md)
