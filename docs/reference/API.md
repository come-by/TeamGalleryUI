# API 接口参考

> 本文档描述 TeamGallery 前端 API 的通用约定、认证方式和数据格式。
> **端点列表以后端 swagger.json 为唯一真理源**，通过 `npm run gen:api` 自动同步类型。

| 项目     | 值         |
| -------- | ---------- |
| 适用     | 前端应用   |
| 最后更新 | 2026-06-25 |

## 目录

## 1. 通用约定

## 2. 认证机制

## 3. 类型安全调用

## 4. 数据模型

## 相关文档

---

## 1. 通用约定

| 配置项       | 值                                                 | 说明                                             |
| ------------ | -------------------------------------------------- | ------------------------------------------------ |
| **Base URL** | `VITE_API_BASE_URL`（环境变量）                    | 默认 `/api/v1`                                   |
| **API 前缀** | `/api/v1`                                          | 完整 URL 为 `${VITE_API_BASE_URL}/xxx`           |
| **认证方式** | Bearer Token（`Authorization` 头）                 | 请求拦截器自动添加                               |
| **数据格式** | JSON                                               |                                                  |
| **分页参数** | `page`（页码，从 1 开始）、`page_size`（每页数量） |                                                  |
| **分页响应** | `data.data[]` + `data.pagination{}`                | 数据在 `data` 数组，分页信息在 `pagination` 对象 |

### 1.1 统一响应格式

```typescript
interface ApiResponse<T = unknown> {
  success: boolean // true 表示成功
  message?: string // 提示信息
  data?: T // 响应数据
  error?: ApiError // 错误信息（失败时）
  request_id?: string // 请求追踪 ID
}

interface ApiError {
  code: string // 错误码，如 "UNAUTHORIZED"
  message: string // 错误消息
  details?: ErrorDetail[] // 字段级错误详情
}

interface ErrorDetail {
  field: string
  message: string
}
```

### 1.2 分页响应格式

```typescript
interface PaginatedResponse<T> {
  data: T[] // 数据列表
  pagination: {
    page: number // 当前页码
    page_size: number // 每页数量
    total: number // 总记录数
    total_pages: number // 总页数
  }
}
```

### 1.3 错误码

> **完整错误码列表**：参见 [错误码字典](./ERROR_CODES.md)。

常见错误码速查：

| 错误码                  | HTTP 状态 | 前端处理                  |
| ----------------------- | --------- | ------------------------- |
| `OK`                    | 200       | 正常处理                  |
| `UNAUTHORIZED`          | 401       | 尝试刷新 Token 或跳转登录 |
| `FORBIDDEN`             | 403       | 提示权限不足              |
| `NOT_FOUND`             | 404       | 提示资源不存在            |
| `VALIDATION_FAILED`     | 400       | 显示字段级错误            |
| `TOO_MANY_REQUESTS`     | 429       | 提示稍后重试              |
| `INTERNAL_SERVER_ERROR` | 500       | 提示服务器错误            |

---

## 2. 认证机制

### 2.1 Token 生命周期

| Token         | 存储位置                        | 有效期  | 用途                |
| ------------- | ------------------------------- | ------- | ------------------- |
| Access Token  | `localStorage`                  | 15 分钟 | API 鉴权            |
| Refresh Token | HttpOnly Cookie（`Set-Cookie`） | 7 天    | 换发新 Access Token |

### 2.2 过期处理流程

1. 路由跳转时前端 JWT 解码 `exp` 字段主动检测
2. Access Token 过期 → 静默调 `/auth/refresh` 换新（Cookie 自动携带）
3. Refresh Token 也过期 → 强制登出，跳转 `/login`
4. 定时 60s + 页面切回前台 + API 返回 401 均触发校验

### 2.3 主要认证接口

| 方法 | 路径            | 说明                       |
| ---- | --------------- | -------------------------- |
| POST | `/login`        | 用户登录                   |
| POST | `/register`     | 用户注册                   |
| POST | `/auth/refresh` | 刷新 Token（Cookie 驱动）  |
| POST | `/auth/logout`  | 登出（撤销 Refresh Token） |
| GET  | `/auth/session` | 会话校验                   |

> 完整端点列表及请求/响应格式以后端 swagger.json 为准，运行 `npm run gen:api` 同步。

---

## 3. 类型安全调用

推荐使用契约客户端，编译期自动校验路径、参数、返回值类型：

```typescript
import { contract } from '@/api/contract'

// GET 请求 — 路径参数 + 查询参数
const article = await contract.get('/articles/{id}', {
  params: { path: { id: 1 } },
})

// POST 请求 — 请求体
const created = await contract.post('/articles', {
  body: { title: '标题', content: '内容' },
})

// 分页请求
const list = await contract.get('/articles', {
  params: { query: { page: 1, page_size: 10 } },
})
```

> 详见 [API 契约管理](../guides/CONTRACT_MANAGEMENT.md)。

---

## 4. 数据模型

### 4.1 自动生成类型

后端接口变更后，运行 `npm run gen:api` 自动从 swagger.json 生成 TypeScript 类型：

```typescript
import type { components } from '@/types/generated/schemas'

// 使用生成的类型
type User = components['schemas']['User']
type Article = components['schemas']['Article']
type Project = components['schemas']['Project']
```

生成文件位置：`src/types/generated/schemas.ts`

### 4.2 核心模型速览

| 模型           | 说明     | 主要字段                                              |
| -------------- | -------- | ----------------------------------------------------- |
| User           | 用户     | id, username, email, avatar, role                     |
| Article        | 文章     | id, title, content, status, type, category_id, author |
| Comment        | 评论     | id, content, article_id, parent_id, user              |
| Project        | 项目     | id, name, description, cover_image, owner, status     |
| ProjectComment | 项目评论 | id, content, project_id, parent_id, user              |
| Notification   | 通知     | id, title, content, type, is_read, created_at         |

> 完整的字段定义及关联关系以 `src/types/generated/schemas.ts` 为准。

---

## 相关文档

- [API 契约管理](../guides/CONTRACT_MANAGEMENT.md)
- [错误码字典](./ERROR_CODES.md)
- [安全策略](./SECURITY.md)
- [开发指南](../guides/DEVELOPMENT.md)
