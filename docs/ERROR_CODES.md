# 错误码字典

> 本文档列出 TeamGallery 后端返回的所有错误码及前端处理建议，供前端开发参考。

| 项目     | 值                         |
| -------- | -------------------------- |
| 适用     | 前端应用                   |
| 数据来源 | 后端 `docs/ERROR_CODES.md` |
| 最后更新 | 2026-06-19                 |

## 目录

## 1. 响应格式

## 2. 通用错误码

## 3. 用户相关错误码

## 4. 文章相关错误码

## 5. 评论相关错误码

## 6. 文件相关错误码

## 7. 项目相关错误码

## 8. 里程碑相关错误码

## 9. 团队相关错误码

## 10. 通知相关错误码

## 11. 防重放保护错误码

## 12. 前端处理建议

## 相关文档

---

## 1. 响应格式

### 1.1 成功响应

```json
{
  "success": true,
  "data": { ... },
  "message": "操作成功"
}
```

### 1.2 错误响应

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "用户友好的错误描述",
    "details": [
      {
        "field": "username",
        "message": "用户名已存在"
      }
    ]
  }
}
```

### 1.3 字段说明

| 字段            | 类型    | 说明                             |
| --------------- | ------- | -------------------------------- |
| `success`       | boolean | 请求是否成功                     |
| `error.code`    | string  | 错误码，用于程序判断             |
| `error.message` | string  | 用户友好的错误描述               |
| `error.details` | array   | 字段级错误详情（验证错误时返回） |

## 2. 通用错误码

| 错误码                  | HTTP 状态码 | 说明           | 前端处理                       |
| ----------------------- | ----------- | -------------- | ------------------------------ |
| `OK`                    | 200         | 成功           | 正常处理                       |
| `NOT_FOUND`             | 404         | 资源不存在     | 显示 404 页面或提示            |
| `UNAUTHORIZED`          | 401         | 未授权访问     | 尝试刷新 Token，失败则跳转登录 |
| `FORBIDDEN`             | 403         | 权限不足       | 显示"权限不足"提示             |
| `BAD_REQUEST`           | 400         | 请求参数错误   | 提示用户检查输入               |
| `INTERNAL_SERVER_ERROR` | 500         | 服务器内部错误 | 显示"服务器错误"提示           |
| `DUPLICATE_ENTRY`       | 409         | 数据已存在     | 提示数据重复                   |
| `VALIDATION_FAILED`     | 400         | 数据验证失败   | 显示字段级错误信息             |
| `METHOD_NOT_ALLOWED`    | 405         | 方法不允许     | 提示操作不支持                 |
| `TOO_MANY_REQUESTS`     | 429         | 请求过多       | 提示稍后重试                   |

## 3. 用户相关错误码

| 错误码                | HTTP 状态码 | 说明       | 前端处理                 |
| --------------------- | ----------- | ---------- | ------------------------ |
| `USER_EXISTS`         | 409         | 用户已存在 | 提示用户名或邮箱已被注册 |
| `USER_NOT_FOUND`      | 404         | 用户不存在 | 提示用户不存在           |
| `INVALID_CREDENTIALS` | 401         | 无效凭证   | 提示用户名或密码错误     |

## 4. 文章相关错误码

| 错误码                    | HTTP 状态码 | 说明                 | 前端处理                      |
| ------------------------- | ----------- | -------------------- | ----------------------------- |
| `ARTICLE_NOT_FOUND`       | 404         | 文章不存在           | 显示 404 页面                 |
| `ARTICLE_PERMISSION`      | 403         | 文章权限不足         | 提示"无权操作此文章"          |
| `ARTICLE_TYPE_PERMISSION` | 403         | 无权发布该类型的文章 | 提示"仅管理员可发布手册/通知" |

## 5. 评论相关错误码

| 错误码               | HTTP 状态码 | 说明         | 前端处理             |
| -------------------- | ----------- | ------------ | -------------------- |
| `COMMENT_NOT_FOUND`  | 404         | 评论不存在   | 提示评论已删除       |
| `COMMENT_PERMISSION` | 403         | 评论权限不足 | 提示"无权操作此评论" |

## 6. 文件相关错误码

| 错误码                  | HTTP 状态码 | 说明           | 前端处理                     |
| ----------------------- | ----------- | -------------- | ---------------------------- |
| `FILE_UPLOAD_FAILED`    | 500         | 文件上传失败   | 提示上传失败，请重试         |
| `FILE_NOT_FOUND`        | 404         | 文件不存在     | 提示文件不存在               |
| `FILE_TOO_LARGE`        | 413         | 文件过大       | 提示文件大小超限（最大 5MB） |
| `FILE_TYPE_NOT_ALLOWED` | 400         | 文件类型不允许 | 提示不支持的文件格式         |

## 7. 项目相关错误码

| 错误码                           | HTTP 状态码 | 说明                   | 前端处理                   |
| -------------------------------- | ----------- | ---------------------- | -------------------------- |
| `PROJECT_NOT_FOUND`              | 404         | 项目不存在             | 显示 404 页面              |
| `PROJECT_PERMISSION`             | 403         | 项目权限不足           | 提示"无权操作此项目"       |
| `PROJECT_MEMBER_EXISTS`          | 409         | 项目成员已存在         | 提示"该用户已是项目成员"   |
| `PROJECT_MEMBER_NOT_FOUND`       | 404         | 项目成员不存在         | 提示成员不存在             |
| `PROJECT_MEMBER_USER_INACTIVE`   | 400         | 待添加用户未激活       | 提示"该用户账号未激活"     |
| `PROJECT_MEMBER_CANNOT_SELF`     | 400         | 不能添加自己           | 提示"不能添加自己为成员"   |
| `PROJECT_MEMBER_INVITE_DISABLED` | 403         | 用户关闭了项目邀请     | 提示"该用户已关闭项目邀请" |
| `PROJECT_MEMBER_BLOCKED`         | 403         | 被目标用户拉黑         | 提示"无法添加该用户"       |
| `PROJECT_INVITE_INVALID`         | 400         | 项目邀请无效           | 提示邀请无效               |
| `PROJECT_ARTICLE_EXISTS`         | 409         | 项目已关联该文章       | 提示"项目已关联此文章"     |
| `PROJECT_ARTICLE_LIMIT_REACHED`  | 400         | 项目关联文章数已达上限 | 提示"关联文章已达上限"     |
| `PROJECT_ALREADY_LIKED`          | 400         | 已点赞该项目           | 忽略（幂等）               |
| `PROJECT_NOT_LIKED`              | 404         | 点赞记录不存在         | 忽略（幂等）               |
| `PROJECT_ALREADY_FAVORITED`      | 400         | 已收藏该项目           | 忽略（幂等）               |
| `PROJECT_NOT_FAVORITED`          | 404         | 收藏记录不存在         | 忽略（幂等）               |

### 7.1 项目评论相关错误码

| 错误码                       | HTTP 状态码 | 说明             | 前端处理                        |
| ---------------------------- | ----------- | ---------------- | ------------------------------- |
| `PROJECT_COMMENT_NOT_FOUND`  | 404         | 项目评论不存在   | 提示评论已删除                  |
| `PROJECT_COMMENT_PERMISSION` | 403         | 项目评论权限不足 | 提示"仅项目成员可查看/发表评论" |

## 8. 里程碑相关错误码

| 错误码                 | HTTP 状态码 | 说明           | 前端处理               |
| ---------------------- | ----------- | -------------- | ---------------------- |
| `MILESTONE_NOT_FOUND`  | 404         | 里程碑不存在   | 提示里程碑不存在       |
| `MILESTONE_PERMISSION` | 403         | 里程碑权限不足 | 提示"无权操作此里程碑" |

## 9. 团队相关错误码

| 错误码                    | HTTP 状态码 | 说明               | 前端处理                 |
| ------------------------- | ----------- | ------------------ | ------------------------ |
| `TEAM_NOT_FOUND`          | 404         | 团队不存在         | 显示 404 页面            |
| `TEAM_PERMISSION`         | 403         | 团队权限不足       | 提示"无权操作此团队"     |
| `TEAM_MEMBER_EXISTS`      | 409         | 团队成员已存在     | 提示"该用户已是团队成员" |
| `TEAM_MEMBER_NOT_FOUND`   | 404         | 团队成员不存在     | 提示成员不存在           |
| `TEAM_INVITE_INVALID`     | 400         | 团队邀请无效       | 提示邀请无效             |
| `TEAM_INVITE_EXPIRED`     | 400         | 团队邀请已过期     | 提示邀请已过期           |
| `TEAM_OWNER_CANNOT_LEAVE` | 403         | 团队创建者不能退出 | 提示"创建者不可退出团队" |

## 10. 通知相关错误码

| 错误码                      | HTTP 状态码 | 说明             | 前端处理       |
| --------------------------- | ----------- | ---------------- | -------------- |
| `NOTIFICATION_NOT_FOUND`    | 404         | 通知不存在       | 提示通知不存在 |
| `NOTIFICATION_ALREADY_READ` | 400         | 通知已标记为已读 | 忽略（幂等）   |

## 11. 防重放保护相关错误码

| 错误码                     | HTTP 状态码 | 说明           | 前端处理                     |
| -------------------------- | ----------- | -------------- | ---------------------------- |
| `REPLAY_NONCE_USED`        | 429         | nonce 已被使用 | 自动重试（前端生成新 nonce） |
| `REPLAY_TIMESTAMP_EXPIRED` | 429         | 时间戳过期     | 自动重试（前端更新时间戳）   |

## 12. 前端处理建议

### 12.1 按错误码分类处理

```typescript
// 前端统一错误处理（src/utils/error.ts）
function handleApiError(error: ApiError) {
  switch (error.code) {
    case 'UNAUTHORIZED':
      // 尝试刷新 Token，失败则跳转登录
      break
    case 'FORBIDDEN':
      // 显示权限不足提示
      ElMessage.error('权限不足')
      break
    case 'VALIDATION_FAILED':
      // 显示表单字段错误
      error.details?.forEach((d) => {
        form.setFieldError(d.field, d.message)
      })
      break
    case 'TOO_MANY_REQUESTS':
      // 提示用户稍后重试
      ElMessage.warning('请求过于频繁，请稍后重试')
      break
    case 'REPLAY_NONCE_USED':
    case 'REPLAY_TIMESTAMP_EXPIRED':
      // 自动重试（前端生成新 nonce）
      break
    default:
      // 显示通用错误提示
      ElMessage.error(error.message || '请求失败')
  }
}
```

### 12.2 错误码处理优先级

1. **4xx 错误**：前端可根据错误码做针对性处理（如跳转登录、显示表单错误）
2. **5xx 错误**：显示通用错误提示，记录日志供排查
3. **details 字段**：优先展示字段级错误信息
4. **幂等错误**：`PROJECT_ALREADY_LIKED`、`NOTIFICATION_ALREADY_READ` 等已存在状态错误，前端直接忽略

## 相关文档

- [API 接口](./API.md)
- [安全策略](./SECURITY.md)
- [开发指南](./DEVELOPMENT.md)
