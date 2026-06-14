# API 接口文档

> 本文档定义 TeamGallery 前端应用的所有 API 调用方式，与后端接口一一对应。

| 项目 | 值 |
|------|-----|
| 适用 | 前端应用 |
| 最后更新 | 2026-06-11 |

## 目录

## 1. 通用说明
## 2. 认证模块
## 3. 用户模块
## 4. 文章模块
## 5. 评论模块
## 6. 互动模块
## 7. 搜索模块
## 8. 上传模块
## 9. 项目管理
## 10. 管理模块
## 11. 数据模型
## 相关文档

---

## 1. 通用说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Base URL** | `VITE_API_BASE_URL`（环境变量） | 默认 `/api` |
| **API 前缀** | 无（直接使用后端路径） | 完整 URL 为 `${VITE_API_BASE_URL}/xxx` |
| **认证方式** | Bearer Token（`Authorization` 头） | 请求拦截器自动添加 |
| **数据格式** | JSON | |
| **分页参数** | `page`（页码，从 1 开始）、`page_size`（每页数量） | |
| **分页响应** | `data.data[]` + `data.pagination{}` | 数据在 `data` 数组，分页信息在 `pagination` 对象 |

### 1.1 统一响应格式

后端返回格式（前端类型定义需与之匹配）：

```typescript
interface ApiResponse<T = unknown> {
  success: boolean      // true 表示成功
  message?: string      // 提示信息
  data?: T             // 响应数据
  error?: ApiError      // 错误信息（失败时）
  request_id?: string   // 请求追踪 ID
}

interface ApiError {
  code: string          // 错误码，如 "UNAUTHORIZED"
  message: string       // 错误消息
  details?: ErrorDetail[] // 错误详情
}

interface ErrorDetail {
  field: string
  message: string
}
```

### 1.2 分页响应格式

```typescript
interface PaginatedResponse<T> {
  data: T[]             // 数据列表
  pagination: {
    page: number        // 当前页码
    page_size: number   // 每页数量
    total: number       // 总记录数
    total_pages: number // 总页数
  }
}
```

### 1.3 错误码

| 错误码 | HTTP 状态 | 前端处理 |
|--------|----------|---------|
| `OK` | 200 | 正常处理 |
| `BAD_REQUEST` | 400 | 提示用户检查输入 |
| `VALIDATION_FAILED` | 400 | 显示字段级错误 |
| `UNAUTHORIZED` | 401 | 尝试刷新 Token 或跳转登录 |
| `INVALID_CREDENTIALS` | 401 | 提示用户名或密码错误 |
| `FORBIDDEN` | 403 | 提示权限不足 |
| `NOT_FOUND` | 404 | 提示资源不存在 |
| `DUPLICATE_ENTRY` | 409 | 提示数据已存在 |
| `FILE_TOO_LARGE` | 413 | 提示文件过大 |
| `TOO_MANY_REQUESTS` | 429 | 提示稍后重试 |
| `INTERNAL_SERVER_ERROR` | 500 | 提示服务器错误 |

---

## 2. 认证模块

对应文件：`src/api/user.ts`

| 方法 | 路径 | 函数 | 认证 |
|------|------|------|------|
| POST | `/login` | `login()` | 否 |
| POST | `/register` | `register()` | 否 |
| POST | `/token/refresh` | `refreshToken()` | Refresh Token |

### 2.1 用户登录

```typescript
login({ username: 'test', password: '123456' })
// POST /api/login
// 响应: { success: true, data: { token: "..." } }
```

### 2.2 用户注册

```typescript
register({ username: 'test', email: 'test@test.com', password: '123456', nickname: '测试' })
// POST /api/register
```

### 2.3 刷新 Token

```typescript
refreshToken()
// POST /api/token/refresh
// 注意：此接口需后端实现
```

---

## 3. 用户模块

对应文件：`src/api/user.ts`

| 方法 | 路径 | 函数 | 认证 |
|------|------|------|------|
| GET | `/profile` | `getProfile()` | 是 |
| DELETE | `/user` | `deleteUser()` | 是 |

### 3.1 获取用户资料

```typescript
getProfile()
// GET /api/profile
```

### 3.2 注销用户

```typescript
deleteUser()
// DELETE /api/user
```

---

## 4. 文章模块

对应文件：`src/api/article.ts`

| 方法 | 路径 | 函数 | 认证 |
|------|------|------|------|
| GET | `/articles` | `getArticles(params)` | 否 |
| GET | `/articles/latest` | `getLatestArticles(count)` | 否 |
| GET | `/articles/:id` | `getArticle(id)` | 否 |
| GET | `/users/:user_id/articles` | `getUserArticles(userId, params)` | 否 |
| POST | `/articles` | `createArticle(data)` | 是 |
| PUT | `/articles/:id` | `updateArticle(id, data)` | 是 |
| DELETE | `/articles/:id` | `deleteArticle(id)` | 是 |

### 4.1 获取文章列表

```typescript
getArticles({ page: 1, page_size: 10, status: 'published' })
// GET /api/articles?page=1&page_size=10&status=published
```

### 4.2 获取最新文章

```typescript
getLatestArticles(5)
// GET /api/articles/latest?count=5
```

### 4.3 创建文章

```typescript
createArticle({
  title: 'Go 语言入门',
  content: '正文...',
  summary: '摘要',
  status: 'published',
  category_id: 1
})
// POST /api/articles
```

---

## 5. 评论模块

对应文件：`src/api/comment.ts`

| 方法 | 路径 | 函数 | 认证 |
|------|------|------|------|
| GET | `/articles/:id/comments` | `getComments(articleId, params)` | 否 |
| GET | `/articles/:id/comments/statistics` | `getCommentStatistics(articleId)` | 否 |
| GET | `/users/:user_id/comments` | `getUserComments(userId, params)` | 否 |
| POST | `/articles/:id/comments` | `createComment(articleId, data)` | 是 |
| DELETE | `/comments/:comment_id` | `deleteComment(commentId)` | 是 |
| POST | `/comments/:id/like` | `likeComment(commentId)` | 否 |
| POST | `/comments/:id/report` | `reportComment(commentId)` | 否 |
| GET | `/admin/comments/pending` | `getPendingComments(params)` | 管理员 |
| PUT | `/admin/comments/:id/approve` | `approveComment(commentId)` | 管理员 |
| PUT | `/admin/comments/:id/reject` | `rejectComment(commentId)` | 管理员 |

### 5.1 获取文章评论

```typescript
getComments(1, { page: 1, page_size: 10 })
// GET /api/articles/1/comments?page=1&page_size=10
```

### 5.2 发表评论

```typescript
createComment(1, { content: '好文章！', parent_id: null })
// POST /api/articles/1/comments
```

---

## 6. 互动模块

对应文件：`src/api/interaction.ts`

| 方法 | 路径 | 函数 | 认证 |
|------|------|------|------|
| POST | `/articles/:id/like` | `likeArticle(articleId)` | 是 |
| DELETE | `/articles/:id/like` | `unlikeArticle(articleId)` | 是 |
| POST | `/articles/:id/favorite` | `favoriteArticle(articleId)` | 是 |
| DELETE | `/articles/:id/favorite` | `unfavoriteArticle(articleId)` | 是 |
| GET | `/favorites` | `getFavorites(params)` | 是 |
| GET | `/likes` | `getLikes(params)` | 是 |
| GET | `/articles/:id/interaction/status` | `getInteractionStatus(articleId)` | 是 |

### 6.1 互动状态查询

```typescript
getInteractionStatus(1)
// GET /api/articles/1/interaction/status
// 响应: { success: true, data: { liked: true, favorited: false } }
```

---

## 7. 搜索模块

对应文件：`src/api/search.ts`

| 方法 | 路径 | 函数 | 认证 |
|------|------|------|------|
| GET | `/search` | `searchArticles(params)` | 否 |
| GET | `/search/suggestions` | `getSuggestions(q, limit)` | 否 |
| GET | `/search/tags/:id` | `searchByTag(tagId, params)` | 否 |
| GET | `/search/categories/:id` | `searchByCategory(categoryId, params)` | 否 |

### 7.1 全文搜索

```typescript
searchArticles({ q: 'Go语言', highlight: true, page: 1, page_size: 10 })
// GET /api/search?q=Go语言&highlight=true&page=1&page_size=10
```

### 7.2 搜索建议

```typescript
getSuggestions('Go', 10)
// GET /api/search/suggestions?q=Go&limit=10
```

---

## 8. 上传模块

对应文件：`src/api/upload.ts`

| 方法 | 路径 | 函数 | 认证 |
|------|------|------|------|
| POST | `/upload/image` | `uploadImage(formData, onProgress)` | 是 |
| POST | `/upload/file` | `uploadFile(formData, onProgress)` | 是 |
| DELETE | `/upload/:path` | `deleteFile(path)` | 是 |

### 8.1 上传图片

```typescript
const formData = new FormData()
formData.append('file', imageFile)
uploadImage(formData)
// POST /api/upload/image
// 响应: { success: true, data: { url: "...", filename: "..." } }
```

---

## 9. 项目管理

对应文件：`src/api/project.ts`、`src/stores/project.ts`、`src/composables/useProject.ts`

| 方法 | 路径 | 函数 | 认证 | 权限 |
|------|------|------|------|------|
| GET | `/projects` | `getProjects(params)` | 否 | - |
| GET | `/projects/:id` | `getProject(id)` | 否 | - |
| POST | `/projects` | `createProject(data)` | 是 | 登录用户 |
| PUT | `/projects/:id` | `updateProject(id, data)` | 是 | owner / admin |
| DELETE | `/projects/:id` | `deleteProject(id)` | 是 | 仅 owner |
| GET | `/projects/:id/members` | `getProjectMembers(projectId, params)` | 否 | - |
| POST | `/projects/:id/members` | `addProjectMember(projectId, data)` | 是 | owner / admin |
| DELETE | `/projects/:id/members/:user_id` | `removeProjectMember(projectId, userId)` | 是 | owner / admin |
| PUT | `/projects/:id/members/:user_id/role` | `updateProjectMemberRole(projectId, userId, data)` | 是 | 仅 owner |

### 9.1 获取项目列表

```typescript
getProjects({ page: 1, page_size: 12, status: 'active', keyword: '搜索词' })
// GET /api/projects?page=1&page_size=12&status=active&keyword=搜索词
```

### 9.2 创建项目

```typescript
createProject({
  name: '新项目',
  description: '项目描述',
  cover_image: 'https://example.com/cover.jpg'
})
// POST /api/projects
// 响应: { success: true, data: { id: 1, name: "新项目", ... } }
```

### 9.3 更新项目

```typescript
updateProject(1, { name: '更新后的名称', status: 'archived' })
// PUT /api/projects/1
```

### 9.4 删除项目

```typescript
deleteProject(1)
// DELETE /api/projects/1
```

### 9.5 成员管理

```typescript
// 获取成员列表
getProjectMembers(1, { page: 1, page_size: 20 })
// GET /api/projects/1/members

// 添加成员
addProjectMember(1, { user_id: 3, role: 'member' })
// POST /api/projects/1/members

// 移除成员
removeProjectMember(1, 3)
// DELETE /api/projects/1/members/3

// 更新成员角色（仅 owner）
updateProjectMemberRole(1, 3, { role: 'admin' })
// PUT /api/projects/1/members/3/role
```

### 9.6 权限矩阵

| 操作 | Owner | Admin | Member | 非成员 |
|------|-------|-------|--------|--------|
| 查看项目 | Y | Y | Y | Y |
| 编辑项目 | Y | Y | N | N |
| 删除项目 | Y | N | N | N |
| 添加成员(member) | Y | Y | N | N |
| 添加成员(admin) | Y | N | N | N |
| 移除成员(member) | Y | Y | N | N |
| 移除成员(admin) | Y | N | N | N |
| 修改成员角色 | Y | N | N | N |

前端通过 `useProject()` composable 的 `canEdit()`、`canDelete()`、`canManageMembers()` 方法控制按钮显隐。

---

## 10. 项目评论模块

对应文件：`src/api/project-comment.ts`

| 方法 | 路径 | 函数 | 认证 | 权限 |
|------|------|------|------|------|
| GET | `/projects/:id/comments` | `getProjectComments(projectId, params)` | 否 | 项目成员 |
| GET | `/projects/:id/comments/statistics` | `getProjectCommentStatistics(projectId)` | 否 | 项目成员 |
| GET | `/users/:user_id/project-comments` | `getUserProjectComments(userId, params)` | 否 | - |
| POST | `/projects/:id/comments` | `createProjectComment(projectId, data)` | 是 | 项目成员 |
| DELETE | `/project-comments/:comment_id` | `deleteProjectComment(commentId)` | 是 | 本人 |
| POST | `/project-comments/:id/like` | `likeProjectComment(commentId)` | 是 | 项目成员 |
| POST | `/project-comments/:id/report` | `reportProjectComment(commentId)` | 是 | 项目成员 |
| GET | `/admin/project-comments/pending` | `getPendingProjectComments(params)` | 是 | 管理员 |
| PUT | `/admin/project-comments/:id/approve` | `approveProjectComment(commentId)` | 是 | 管理员 |
| PUT | `/admin/project-comments/:id/reject` | `rejectProjectComment(commentId)` | 是 | 管理员 |

### 10.1 获取项目评论

```typescript
getProjectComments(1, { page: 1, page_size: 10 })
// GET /api/projects/1/comments?page=1&page_size=10
```

### 10.2 发表评论

```typescript
createProjectComment(1, { content: '项目进展顺利！', parent_id: null })
// POST /api/projects/1/comments
```

### 10.3 权限矩阵

| 操作 | Owner | Admin | Member | 非成员 |
|------|-------|-------|--------|--------|
| 查看评论 | Y | Y | Y | N |
| 发表评论 | Y | Y | Y | N |
| 删除自己的评论 | Y | Y | Y | N |
| 删除他人评论 | Y | Y | N | N |
| 点赞/举报评论 | Y | Y | Y | N |

> 仅项目成员可查看和参与项目评论区，非成员无法访问。

---

## 11. 管理模块

对应文件：`src/api/admin.ts`

| 方法 | 路径 | 函数 | 认证 |
|------|------|------|------|
| GET | `/admin/users` | `getUsers(params)` | 管理员 |

### 9.1 获取用户列表

```typescript
getUsers({ page: 1, page_size: 10 })
// GET /api/admin/users?page=1&page_size=10
```

---

## 12. 数据模型

### 12.1 User

```typescript
interface User {
  id: number
  username: string
  email: string
  nickname?: string
  avatar?: string
  role: string
  profile?: {
    bio?: string
    website?: string
    github?: string
    location?: string
  }
  created_at: string
}
```

### 12.2 Article

```typescript
interface Article {
  id: number
  title: string
  content: string
  summary?: string
  cover_image?: string
  status: string
  slug?: string
  view_count: number
  like_count: number
  comment_count: number
  user?: Pick<User, 'id' | 'username' | 'nickname'>
  category?: { id: number; name: string }
  tags?: Array<{ id: number; name: string }>
  created_at: string
  updated_at: string
  published_at?: string
}
```

### 12.3 Comment

```typescript
interface Comment {
  id: number
  content: string
  status: string
  like_count: number
  user: Pick<User, 'id' | 'username' | 'avatar'>
  parent_id: number | null
  replies: Comment[]
  created_at: string
}
```

### 12.4 InteractionStatus

```typescript
interface InteractionStatus {
  liked: boolean
  favorited: boolean
}
```

### 12.5 Project

```typescript
interface Project {
  id: number
  name: string
  description: string
  cover_image: string
  status: 'active' | 'archived'
  owner_id: number
  team_id?: number
  created_at: string
  updated_at: string
  owner?: User
  members?: ProjectMember[]
}
```

### 12.6 ProjectMember

```typescript
interface ProjectMember {
  project_id: number
  user_id: number
  role: 'owner' | 'admin' | 'member'
  created_at: string
  user?: User
}
```

### 12.7 ProjectComment

```typescript
interface ProjectComment {
  id: number
  content: string
  status: string
  like_count: number
  report_count: number
  user: Pick<User, 'id' | 'username' | 'avatar'>
  parent_id: number | null
  replies: ProjectComment[]
  created_at: string
}
```

### 12.8 代码生成

后端接口变更后，前端运行以下命令自动生成 TypeScript 类型：

```bash
npm run gen:api
```

生成文件位置：`src/types/generated/schemas.ts`

使用示例：

```typescript
import type { components } from '@/types/generated/schemas'

type User = components['schemas']['User']
type Article = components['schemas']['Article']
```

## 相关文档

- [架构设计](./ARCHITECTURE.md)
- [开发指南](./DEVELOPMENT.md)
- [安全策略](./SECURITY.md)
