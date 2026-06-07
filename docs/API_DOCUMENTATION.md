# TeamGallery API 接口文档

> 本文档定义了 TeamGallery 项目的所有 API 接口，供前后端开发参考。

## 1. 通用说明

| 配置项 | 值 | 说明 |
|--------|-----|------|
| **Base URL** | `VITE_API_BASE_URL`（环境变量） |
| **API 前缀** | `/v1/`（所有接口自动添加版本前缀） |
| **完整 URL** | `${VITE_API_BASE_URL}/v1/...` |
| **认证方式** | Bearer Token（Authorization 头） |
| **数据格式** | JSON |
| **分页参数** | `page`（页码，从 1 开始）、`page_size`（每页数量） |

### 1.1 统一响应格式

```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

### 1.2 错误码

| 错误码 | 说明 | HTTP 状态 |
|--------|------|----------|
| `0` | 成功 | 200 |
| `400` | 请求参数错误 | 400 |
| `401` | 未授权/Token 过期 | 401 |
| `403` | 权限不足 | 403 |
| `404` | 资源不存在 | 404 |
| `429` | 请求过于频繁 | 429 |
| `500` | 服务器错误 | 500 |

## 2. 认证模块

### 2.1 用户登录

- **URL**: `POST /v1/login`
- **认证**: 不需要
- **请求体**:
```json
{
  "username": "string",
  "password": "string"
}
```
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "string",
    "refresh_token": "string",
    "user": {
      "id": "string",
      "username": "string",
      "email": "string",
      "avatar": "string"
    }
  }
}
```

### 2.2 用户注册

- **URL**: `POST /v1/register`
- **认证**: 不需要
- **请求体**:
```json
{
  "username": "string",
  "email": "string",
  "password": "string"
}
```
- **响应**: 同登录响应

### 2.3 刷新 Token

- **URL**: `POST /v1/refresh`
- **认证**: Refresh Token（Cookie）
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "access_token": "string"
  }
}
```

### 2.4 退出登录

- **URL**: `POST /v1/logout`
- **认证**: Bearer Token
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": null
}
```

## 3. 用户模块

### 3.1 获取当前用户信息

- **URL**: `GET /v1/user`
- **认证**: Bearer Token
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": "string",
    "username": "string",
    "email": "string",
    "avatar": "string",
    "bio": "string",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### 3.2 更新用户信息

- **URL**: `PUT /v1/user`
- **认证**: Bearer Token
- **请求体**:
```json
{
  "username": "string",
  "bio": "string",
  "avatar": "string"
}
```

### 3.3 获取用户文章列表

- **URL**: `GET /v1/user/{user_id}/articles`
- **认证**: 不需要
- **查询参数**: `page`, `page_size`

## 4. 文章模块

### 4.1 获取文章列表

- **URL**: `GET /v1/articles`
- **认证**: 不需要
- **查询参数**:
  - `page`: 页码（默认 1）
  - `page_size`: 每页数量（默认 10）
  - `category`: 分类筛选
  - `sort`: 排序方式（`latest`, `popular`）
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "id": "string",
        "title": "string",
        "summary": "string",
        "cover_image": "string",
        "author": {
          "id": "string",
          "username": "string",
          "avatar": "string"
        },
        "category": "string",
        "view_count": 0,
        "like_count": 0,
        "comment_count": 0,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "page_size": 10
  }
}
```

### 4.2 获取文章详情

- **URL**: `GET /v1/articles/{article_id}`
- **认证**: 不需要

### 4.3 创建文章

- **URL**: `POST /v1/articles`
- **认证**: Bearer Token
- **请求体**:
```json
{
  "title": "string",
  "content": "string",
  "summary": "string",
  "cover_image": "string",
  "category": "string",
  "tags": ["string"]
}
```

### 4.4 更新文章

- **URL**: `PUT /v1/articles/{article_id}`
- **认证**: Bearer Token（仅作者）

### 4.5 删除文章

- **URL**: `DELETE /v1/articles/{article_id}`
- **认证**: Bearer Token（仅作者或管理员）

## 5. 评论模块

### 5.1 获取文章评论

- **URL**: `GET /v1/articles/{article_id}/comments`
- **查询参数**: `page`, `page_size`

### 5.2 发表评论

- **URL**: `POST /v1/articles/{article_id}/comments`
- **认证**: Bearer Token
- **请求体**:
```json
{
  "content": "string",
  "parent_id": "string"  // 可选，回复评论
}
```

### 5.3 删除评论

- **URL**: `DELETE /v1/comments/{comment_id}`
- **认证**: Bearer Token

## 6. 互动模块

### 6.1 点赞文章

- **URL**: `POST /v1/articles/{article_id}/like`
- **认证**: Bearer Token

### 6.2 取消点赞

- **URL**: `DELETE /v1/articles/{article_id}/like`
- **认证**: Bearer Token

### 6.3 收藏文章

- **URL**: `POST /v1/articles/{article_id}/favorite`
- **认证**: Bearer Token

### 6.4 取消收藏

- **URL**: `DELETE /v1/articles/{article_id}/favorite`
- **认证**: Bearer Token

### 6.5 获取用户收藏

- **URL**: `GET /v1/user/favorites`
- **认证**: Bearer Token
- **查询参数**: `page`, `page_size`

### 6.6 获取用户点赞

- **URL**: `GET /v1/user/likes`
- **认证**: Bearer Token
- **查询参数**: `page`, `page_size`

## 7. 搜索模块

### 7.1 搜索文章

- **URL**: `GET /v1/search`
- **认证**: 不需要
- **查询参数**:
  - `q`: 搜索关键词（必填）
  - `page`: 页码
  - `page_size`: 每页数量
  - `category`: 分类筛选

## 8. 上传模块

### 8.1 上传文件

- **URL**: `POST /v1/upload`
- **认证**: Bearer Token
- **请求类型**: `multipart/form-data`
- **请求体**:
  - `file`: 文件（必填）
  - `type`: 文件类型（`avatar`, `cover`, `content`）
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "url": "https://example.com/uploads/xxx.jpg",
    "filename": "xxx.jpg",
    "size": 12345
  }
}
```

## 9. 管理模块

### 9.1 获取用户列表

- **URL**: `GET /v1/admin/users`
- **认证**: Bearer Token（管理员）
- **查询参数**: `page`, `page_size`, `keyword`

### 9.2 获取评论列表

- **URL**: `GET /v1/admin/comments`
- **认证**: Bearer Token（管理员）
- **查询参数**: `page`, `page_size`, `status`

### 9.3 删除评论（管理员）

- **URL**: `DELETE /v1/admin/comments/{comment_id}`
- **认证**: Bearer Token（管理员）

### 9.4 获取统计数据

- **URL**: `GET /v1/admin/stats`
- **认证**: Bearer Token（管理员）
- **响应**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "total_users": 1000,
    "total_articles": 5000,
    "total_comments": 20000,
    "today_active_users": 200
  }
}
```

## 10. 数据模型

### 10.1 User

```typescript
interface User {
  id: string
  username: string
  email: string
  avatar?: string
  bio?: string
  created_at: string
}
```

### 10.2 Article

```typescript
interface Article {
  id: string
  title: string
  content: string
  summary?: string
  cover_image?: string
  author: User
  category?: string
  tags?: string[]
  view_count: number
  like_count: number
  comment_count: number
  created_at: string
  updated_at: string
}
```

### 10.3 Comment

```typescript
interface Comment {
  id: string
  content: string
  author: User
  article_id: string
  parent_id?: string
  created_at: string
}
```

### 10.4 PaginatedResponse

```typescript
interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  page_size: number
}
```
