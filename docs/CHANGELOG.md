# 更新日志

> 本文档记录 TeamGallery 前端应用的版本变更和重要更新。

| 项目     | 值         |
| -------- | ---------- |
| 适用     | 前端应用   |
| 最后更新 | 2026-06-19 |

## 目录

## [1.7.0] - 未发布

### 新增

- **聊天模块**：新增 ChatView（`/chat`），支持群聊消息发送和查看
  - `api/chat.ts`：`getChatMessages()`、`sendChatMessage()` API 方法
  - 消息轮询间隔 3 秒，支持游标分页加载历史消息
- **通知模块**：新增 NotificationListView 和 NotificationDetailView
  - `api/notification.ts`：通知列表、未读数、已读标记 API
  - 导航栏铃铛图标 + 红点未读徽标
- **操作手册**：新增 ManualListView 和 ManualDetailView（`/manuals`）
- **首页重定向**：`/` 自动重定向到 `/projects`
- **导航栏重构**：移除文章链接，增加手册入口和铃铛通知图标

### 变更

- **RefreshToken 迁移至 HttpOnly Cookie**：`refresh_token` 不再通过 `localStorage` 管理，改为后端 `Set-Cookie` 下发
  - `api/user.ts`：login/refreshToken/logoutApi 去除了 refresh_token 手动传递
  - `api/request.ts`：`refreshAccessToken()` 改用 Cookie 驱动，去除 localStorage 读写
  - `stores/user.ts`：去除 `refreshToken` 状态、`setTokens()` 改为 `setAccessToken()`、`checkTokenValidity` 简化
  - `composables/useAuth.ts`：去除 `isRefreshTokenValid` 计算属性
  - `router/index.ts`：路由守卫简化 refresh_token 检查逻辑
  - `composables/useSessionMonitor.ts`：会话监控适配 Cookie 刷新流程
- **新增用户搜索**：`api/user.ts` 新增 `searchUsers()` 方法（`GET /api/users/search`）
- **类型更新**：`LoginResponse` 去除 `refresh_token`，`api.ts` 新增 `token_type`，`user.ts` 新增 `SearchUsersResponse`
- 铃铛红点提示：基于未读通知数的 el-badge 徽标
- 未读数轮询：每 30 秒轮询 `/api/notifications/unread-count`

## [Unreleased]

### 待发布

- 初始版本开发中

## 相关文档

- [开发路线图](./ROADMAP.md)
- [开发指南](./DEVELOPMENT.md)
- [API 接口](./API.md)

---

## 版本格式说明

遵循 [Semantic Versioning](https://semver.org/lang/zh-CN/) 规范：

- **主版本号**：不兼容的 API 修改
- **次版本号**：向下兼容的功能性新增
- **修订号**：向下兼容的问题修正

### 变更类型

| 类型         | 说明           |
| ------------ | -------------- |
| `Added`      | 新增功能       |
| `Changed`    | 现有功能的变更 |
| `Deprecated` | 即将移除的功能 |
| `Removed`    | 已移除的功能   |
| `Fixed`      | Bug 修复       |
| `Security`   | 安全修复       |
