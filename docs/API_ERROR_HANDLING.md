# API 错误处理规范

## 概述

本项目已实现完整的 API 错误处理机制，包括错误码定义、统一错误提示、网络重试、Token 自动刷新和错误上报。

## 错误码定义

所有错误码定义在 `src/types/api.ts` 的 `ErrorCode` 枚举中。

### 错误码分类

| 分类     | 错误码                                                                            | 说明          |
| -------- | --------------------------------------------------------------------------------- | ------------- |
| 通用错误 | `NOT_FOUND`, `BAD_REQUEST`, `INTERNAL_SERVER_ERROR`                               | HTTP 标准错误 |
| 认证错误 | `UNAUTHORIZED`, `FORBIDDEN`                                                       | 权限相关      |
| 验证错误 | `VALIDATION_FAILED`, `DUPLICATE_ENTRY`                                            | 数据验证      |
| 用户错误 | `USER_EXISTS`, `USER_NOT_FOUND`, `INVALID_CREDENTIALS`                            | 用户操作      |
| 文章错误 | `ARTICLE_NOT_FOUND`, `ARTICLE_PERMISSION`                                         | 文章操作      |
| 评论错误 | `COMMENT_NOT_FOUND`, `COMMENT_PERMISSION`                                         | 评论操作      |
| 文件错误 | `FILE_UPLOAD_FAILED`, `FILE_NOT_FOUND`, `FILE_TOO_LARGE`, `FILE_TYPE_NOT_ALLOWED` | 文件操作      |
| 限流错误 | `TOO_MANY_REQUESTS`                                                               | 请求频率限制  |

## 错误处理流程

### 1. 请求层 (`src/api/request.ts`)

**职责：** 网络层错误处理

- Token 自动附加
- Token 过期自动刷新
- 网络错误重试（最多 2 次，间隔 1 秒）
- 请求去重（相同请求共享 Promise）

### 2. 工具层 (`src/utils/error.ts`)

**职责：** 错误分类和消息映射

- `getErrorMessage()` - 获取用户友好的错误消息
- `handleApiError()` - 统一错误提示（ElMessage）
- `handleValidationError()` - 验证错误处理
- `isUnauthorized()` / `isForbidden()` / `isNotFound()` / `isValidationError()` - 错误类型判断

### 3. 组件层 (`src/composables/useErrorHandler.ts`)

**职责：** 组件级错误状态管理

- `useErrorHandler()` - 统一错误状态管理
- `useAsyncError()` - 异步操作错误处理

### 4. 全局层 (`src/components/ErrorBoundary.vue`)

**职责：** 全局错误边界

- 捕获未处理的错误
- 显示友好的错误页面
- 错误上报

## 错误上报

使用 Sentry 进行错误上报，配置在 `src/utils/error-report.ts`。

### 上报函数

| 函数               | 用途                          |
| ------------------ | ----------------------------- |
| `reportError()`    | 上报错误到 Sentry             |
| `reportApiError()` | 上报 API 错误（包含请求信息） |
| `addBreadcrumb()`  | 添加面包屑（用于追踪）        |
| `setUserContext()` | 设置用户上下文                |

## 使用示例

### 基础用法

```typescript
import { handleApiError } from '@/utils/error'

try {
  const data = await apiCall()
} catch (error) {
  handleApiError(error)
}
```

### 组件内用法

```typescript
import { useErrorHandler } from '@/composables/useErrorHandler'

const { error, hasError, handleApiError } = useErrorHandler()

const fetchData = async () => {
  try {
    const data = await apiCall()
  } catch (err) {
    handleApiError(err)
  }
}
```

### 验证错误处理

```typescript
import { handleValidationError } from '@/utils/error'

try {
  const data = await apiCall()
} catch (error) {
  if (error.details) {
    handleValidationError(error.details)
  } else {
    handleApiError(error)
  }
}
```

## 扩展错误码

添加新错误码的步骤：

1. 在 `src/types/api.ts` 的 `ErrorCode` 枚举中添加
2. 在 `src/utils/error.ts` 的 `ERROR_MESSAGES` 中添加中文映射
3. 如需特殊处理，添加对应的 `is*()` 判断函数

## 注意事项

1. **不要在 API 层直接显示错误** - 使用 `handleApiError` 统一处理
2. **敏感信息过滤** - 错误上报时自动过滤敏感数据
3. **网络重试** - 仅对网络错误重试，不对业务错误重试
4. **Token 刷新** - 401 错误自动刷新 Token，刷新失败跳转登录
