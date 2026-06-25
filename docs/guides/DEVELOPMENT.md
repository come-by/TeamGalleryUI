# 开发指南

> 本文档帮助开发者快速上手 TeamGallery 前端应用的本地开发。

| 项目     | 值         |
| -------- | ---------- |
| 适用     | 前端应用   |
| 最后更新 | 2026-06-25 |

## 目录

## 1. 环境要求

## 2. 快速开始

## 3. 项目配置

## 4. 常用命令

## 5. 项目结构速览

## 6. 新增功能流程

## 7. 状态管理

## 相关文档

---

## 1. 环境要求

| 工具    | 版本  | 说明                                      |
| ------- | ----- | ----------------------------------------- |
| Node.js | >= 20 | 从 [nodejs.org](https://nodejs.org/) 安装 |
| npm     | >= 9  | 随 Node.js 一起安装                       |

验证安装：

```bash
node -v    # 确认 >= 20
npm -v     # 确认 >= 9
```

## 2. 快速开始

```bash
# 1. 克隆仓库
git clone <repo-url>
cd TeamGalleryUI

# 2. 安装依赖
npm install

# 3. 复制环境变量
cp .env.example .env.development

# 4. 启动开发服务器
npm run dev
```

服务启动后访问：`http://localhost:5173`

## 3. 项目配置

### 3.1 环境变量

配置文件 `.env.development`：

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_APP_TITLE=TeamGallery
```

| 变量                | 说明          | 默认值                         |
| ------------------- | ------------- | ------------------------------ |
| `VITE_API_BASE_URL` | 后端 API 地址 | `http://localhost:8080/api/v1` |
| `VITE_APP_TITLE`    | 应用标题      | `TeamGallery`                  |

### 3.2 工具链配置

| 工具       | 配置文件            | 说明         |
| ---------- | ------------------- | ------------ |
| ESLint     | `eslint.config.js`  | 代码质量检查 |
| Prettier   | `.prettierrc`       | 代码格式化   |
| Stylelint  | `.stylelintrc.json` | 样式检查     |
| TypeScript | `tsconfig.json`     | 类型检查     |
| Vitest     | `vitest.config.ts`  | 单元测试     |

## 4. 常用命令

| 命令                      | 说明                                                 |
| ------------------------- | ---------------------------------------------------- |
| `npm run dev`             | 启动开发服务器                                       |
| `npm run build`           | 构建生产版本                                         |
| `npm run preview`         | 预览生产构建                                         |
| `npm run lint`            | ESLint 检查并修复                                    |
| `npm run lint:check`      | ESLint 仅检查                                        |
| `npm run lint:style`      | Stylelint 检查并修复                                 |
| `npm run format`          | Prettier 格式化                                      |
| `npm run test`            | 运行测试（监听模式）                                 |
| `npm run test:run`        | 运行测试（一次）                                     |
| `npm run test:coverage`   | 生成覆盖率报告                                       |
| `npm run gen:api`         | 从后端 swagger.json 生成 TypeScript 类型和契约客户端 |
| `npm run contract:verify` | 一键验证 API 契约一致性                              |
| `npx vue-tsc --noEmit`    | TypeScript 类型检查                                  |

> **API 契约管理**：后端 Swagger 是唯一真理源，详见 [API 契约管理](./CONTRACT_MANAGEMENT.md)。

## 5. 项目结构速览

```
src/
├── api/              # API 请求层（Axios 封装）
├── assets/           # 静态资源（样式、图片）
├── components/       # 公共组件
├── composables/      # 组合式函数（业务逻辑）
├── layouts/          # 布局组件
├── mocks/            # Mock 数据（MSW）
├── router/           # 路由配置
├── stores/           # Pinia 状态管理
├── types/            # TypeScript 类型定义
├── utils/            # 工具函数
└── views/            # 页面组件
```

详见 [架构设计](../project/ARCHITECTURE.md)

## 6. 新增功能流程

以下步骤说明如何添加一个新功能（以"文章收藏列表"为例）：

### 6.1 定义类型

在 `src/types/` 中添加类型定义：

```typescript
// src/types/favorite.ts
export interface Favorite {
  id: string
  article_id: string
  created_at: string
}
```

### 6.2 添加 API 请求

**推荐：使用契约客户端**（自动从 swagger 获取类型，编译期安全）

```typescript
// 直接在组件/composable 中使用 contract
import { contract } from '@/api/contract'

const res = await contract.get('/favorites', {
  params: { query: { page: 1, page_size: 10 } },
})
// res 类型自动推导
```

**旧方式：手写 API 函数**（需手动维护，容易漂移）

```typescript
// src/api/favorite.ts
import request from './request'

export const getFavorites = (params: ListParams) => request.get('/favorites', { params })
```

### 6.3 创建 Composable

在 `src/composables/` 中封装业务逻辑：

```typescript
// src/composables/useFavorites.ts
import { ref } from 'vue'
import { getFavorites } from '@/api/favorite'

export function useFavorites() {
  const favorites = ref<Favorite[]>([])
  const loading = ref(false)

  async function loadFavorites() {
    loading.value = true
    try {
      const res = await getFavorites({ page: 1, page_size: 10 })
      favorites.value = res.data.items
    } finally {
      loading.value = false
    }
  }

  return { favorites, loading, loadFavorites }
}
```

### 6.4 创建页面组件

在 `src/views/` 中创建页面：

```vue
<!-- src/views/user/FavoritesView.vue -->
<script setup lang="ts">
import { onMounted } from 'vue'
import { useFavorites } from '@/composables/useFavorites'

const { favorites, loading, loadFavorites } = useFavorites()
onMounted(loadFavorites)
</script>

<template>
  <div class="favorites-view">
    <h1>我的收藏</h1>
    <div v-if="loading">加载中...</div>
    <div v-else>
      <div v-for="item in favorites" :key="item.id">
        {{ item.article_id }}
      </div>
    </div>
  </div>
</template>
```

### 6.5 注册路由

在 `src/router/index.ts` 中添加路由：

```typescript
{
  path: '/user/favorites',
  name: 'Favorites',
  component: () => import('@/views/user/FavoritesView.vue'),
  meta: { requiresAuth: true }
}
```

### 6.6 编写测试

创建对应的测试文件：

```typescript
// src/composables/useFavorites.test.ts
import { describe, it, expect, vi } from 'vitest'
import { useFavorites } from './useFavorites'

describe('useFavorites', () => {
  it('应该正确加载收藏列表', async () => {
    // 测试逻辑
  })
})
```

## 7. 状态管理

### 7.1 何时使用 Pinia

| 场景                     | 推荐方案     |
| ------------------------ | ------------ |
| 全局共享状态（用户信息） | Pinia Store  |
| 页面级状态（列表数据）   | 组件本地状态 |
| 表单数据                 | 组件本地状态 |
| UI 状态（加载/错误）     | 组件本地状态 |

### 7.2 何时使用 Composable

- 可复用的业务逻辑
- 需要组合多个 API 调用
- 需要管理副作用（防抖、节流）

> **常见问题排查**：开发中遇到问题请查阅 [常见问题排查](./TROUBLESHOOTING.md)。

## 相关文档

- [API 契约管理](./CONTRACT_MANAGEMENT.md)
- [架构设计](../project/ARCHITECTURE.md)
- [代码规范](../project/CODING_STANDARDS.md)
- [API 接口](../reference/API.md)
- [测试指南](./TESTING.md)
- [常见问题排查](./TROUBLESHOOTING.md)
